import './scss/styles.scss';

import { EventEmitter } from './components/common/base/events';
import { CommerceAPI } from './components/app/api/commerce-api';

import { Page } from './components/common/page';
import { Modal } from './components/common/modal';
import { Basket } from './components/app/basket';
import { ProductCard } from './components/app/product-card';
import { ProductCardPreview } from './components/app/product-card-preview';

import { OrderForm } from './components/app/forms/order-form';
import { ContactsForm } from './components/app/forms/contacts-form';
import { SuccessView } from './components/app/forms/success';

import { ProductModel } from './components/app/models/product-model';
import { CartModel } from './components/app/models/cart-model';
import { OrderModel } from './components/app/models/order-model';

import { buildBasketItem } from './components/app/basket-item';
import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL } from './utils/constants';

import type { IProduct, OrderPayload } from './types';
import { AppEvents } from './types';


const events = new EventEmitter();
const api = new CommerceAPI(API_URL, {});
const page = new Page(document.body, events);
const modal = new Modal(ensureElement('#modal-container'), events);

const products = new ProductModel();
const cart = new CartModel();
const order = new OrderModel();


let basketView: Basket;
let basketEl: HTMLElement;


function decorateCartWithEvents(c: CartModel): void {
  const addItemOrig = c.addItem.bind(c);
  const removeItemOrig = c.removeItem.bind(c);
  const clearCartOrig = c.clearCart.bind(c);

  const notify = (): void => {
    events.emit(AppEvents.CART_UPDATED, {
      items: c.items.map((i: IProduct) => i.id),
      total: c.getTotal(),
      count: c.items.length,
    });
  };

  (c as unknown as { addItem: (p: IProduct) => void }).addItem = (p: IProduct): void => {
    const before = c.items.length;
    addItemOrig(p);
    if (c.items.length !== before) notify();
  };

  (c as unknown as { removeItem: (id: string) => void }).removeItem = (id: string): void => {
    const before = c.items.length;
    removeItemOrig(id);
    if (c.items.length !== before) notify();
  };

  (c as unknown as { clearCart: () => void }).clearCart = (): void => {
    if (c.items.length === 0) return;
    clearCartOrig();
    notify();
  };
}


window.addEventListener('DOMContentLoaded', () => {
  void init();
});

async function init(): Promise<void> {
  console.debug('API_URL =', API_URL);

  decorateCartWithEvents(cart);

  basketView = new Basket(cloneTemplate<HTMLDivElement>('#basket'), events);

  events.on('basket:open', () => openBasket());
  events.on('order:open', () => openOrderStep1());
  events.on('modal:open', () => (page.locked = true));
  events.on('modal:close', () => (page.locked = false));

  events.on(AppEvents.CART_UPDATED, () => {
    renderBasketFromModel();
    updateHeader();
  });

  const raw = await api.getProducts();
  const rawList: unknown[] = Array.isArray(raw) ? raw : [];
  products.setProducts(rawList);

  renderCatalog();
  renderBasketFromModel();
  updateHeader();
}

function renderCatalog(): void {
  if (!products.products.length) {
    page.render({ counter: cart.items.length, catalog: [], locked: false });
    return;
  }

  const cards: HTMLElement[] = products.products.map((p: IProduct) =>
    new ProductCard(cloneTemplate<HTMLButtonElement>('#card-catalog'), {
      onPreview: (id: string): void => openPreview(id),
    }).render(p)
  );

  page.render({ counter: cart.items.length, catalog: cards, locked: false });
}

function openPreview(productId: string): void {
  const p = products.getProduct(productId);
  if (!p) return;

  const inCart = cart.items.some((i) => i.id === p.id);

  const previewCmp = new ProductCardPreview(
    cloneTemplate<HTMLDivElement>('#card-preview'),
    {
      onToggleCart: (id: string): void => {
        const prod = products.getProduct(id);
        if (!prod) return;

        const already = cart.items.some((i) => i.id === id);
        if (already) cart.removeItem(id);
        else cart.addItem(prod);

        previewCmp.render({ ...prod, inCart: !already });
      },
    }
  );

  const previewEl = previewCmp.render({ ...p, inCart });
  modal.render({ content: previewEl });
}

function renderBasketFromModel(): void {
  const itemsEls: HTMLElement[] = cart.items.map((p, idx) =>
    buildBasketItem(p, idx + 1, (id: string): void => {
      cart.removeItem(id);
    })
  );

  basketEl = basketView.render({
    items: itemsEls,
    total: cart.getTotal(),
    selected: cart.items.map((i) => i.id),
  });
}

function openBasket(): void {
  modal.render({ content: basketEl });
}

function openOrderStep1(): void {
  const formCmp = new OrderForm(
    cloneTemplate<HTMLFormElement>('#order'),
    events
  );

  if (!order.payment) {
    order.setPayment('card');
    formCmp.setInitialPayment?.('card');
  }

  const renderFromModel = (): void => {
    const hasAddress = (order.address ?? '').trim().length > 0;
    const hasPayment = !!order.payment;

    formCmp.render({
      payment: order.payment ?? null,
      address: order.address ?? '',
      valid: hasAddress && hasPayment,
      errors: hasAddress ? '' : 'Необходимо указать адрес',
    });
  };

  events.on(
    AppEvents.ORDER_ADDRESS_CHANGED,
    ({ payment, address }: { payment: 'card' | 'cash' | null; address: string }) => {
      if (payment) order.setPayment(payment);
      if (typeof address === 'string') order.setAddress(address);
      renderFromModel();
    }
  );

  events.on(AppEvents.ORDER_SUBMITTED, () => {
    const hasAddress = (order.address ?? '').trim().length > 0;
    const hasPayment = !!order.payment;

    if (!hasAddress || !hasPayment) {
      renderFromModel();
      return;
    }
    openOrderStep2();
  });

  renderFromModel();

  const formEl: HTMLElement = formCmp.render({
    payment: order.payment ?? null,
    address: order.address ?? '',
    valid: (order.address ?? '').trim().length > 0 && !!order.payment,
    errors: '',
  });

  modal.render({ content: formEl });
}

function openOrderStep2(): void {
  const formCmp = new ContactsForm(cloneTemplate<HTMLFormElement>('#contacts'), events);

  events.on('contacts.email:change', (p: { field: 'email'; value: string }) => {
    order.setEmail(p.value);
  });
  events.on('contacts.phone:change', (p: { field: 'phone'; value: string }) => {
    order.setPhone(p.value);
  });

  events.on('contacts:submit', async () => {
    if (!order.validate()) {
      formCmp.errors = 'Заполните все поля формы';
      formCmp.render({ valid: false, errors: formCmp.errors });
      return;
    }

    const payload: OrderPayload = {
      payment: order.payment!,
      address: order.address,
      email:   order.email,
      phone:   order.phone,
      items:   cart.items.map((i: IProduct) => i.id),
      total:   cart.getTotal(),
    };

    try {
      // @ts-ignore — метод может вернуть void
      const res = await api.createOrder(payload);
      // @ts-ignore — если сервер вернёт total
      const totalFromServer: number | undefined = res?.total;
      const total = typeof totalFromServer === 'number' ? totalFromServer : cart.getTotal();

      cart.clearCart();
      openSuccess(total);
    } catch (e) {
      console.error('Order failed', e);
      formCmp.errors = 'Не удалось оформить заказ. Попробуйте ещё раз.';
      formCmp.render({ valid: true, errors: formCmp.errors });
    }
  });

  const formEl = formCmp.render({ valid: false, errors: '' });
  modal.render({ content: formEl });
}

function openSuccess(total: number): void {
  const successCmp = new SuccessView(cloneTemplate<HTMLDivElement>('#success'));
  const successEl = successCmp.render({
    total,
    onClose: () => modal.close(),
  });
  modal.render({ content: successEl });
}

function updateHeader(): void {
  page.counter = cart.items.length;
}
