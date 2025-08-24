// src/index.ts
import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { CommerceAPI } from './components/common/api/commerce-api';

import { Page } from './components/common/page';
import { Modal } from './components/common/modal';
import { Basket } from './components/common/basket';
import { ProductCard } from './components/common/product-card';
import { ProductCardPreview } from './components/common/product-card-preview';

import { OrderForm } from './components/common/forms/order-form';
import { ContactsForm } from './components/common/forms/contacts-form';
import { SuccessView } from './components/common/forms/success';

import { ProductModel } from './components/common/models/product-model';
import { CartModel } from './components/common/models/cart-model';
import { OrderModel } from './components/common/models/order-model';

import { buildBasketItem } from './components/common/basket-item';
import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL } from './utils/constants';

import type { IProduct, OrderPayload } from './types';
import { AppEvents } from './types';

// ----- инфраструктура
const events = new EventEmitter();
const api = new CommerceAPI(API_URL, {});
const page = new Page(document.body, events);
const modal = new Modal(ensureElement('#modal-container'), events);

const products = new ProductModel();
const cart = new CartModel(); // CartModel не трогаем
const order = new OrderModel();

// статичный View корзины (создаём один раз)
let basketView: Basket;
let basketEl: HTMLElement;

// === ДЕКОРАТОР КОРЗИНЫ (без изменения CartModel) ===
function decorateCartWithEvents(c: CartModel): void {
  const addItemOrig: (prod: IProduct) => void = c.addItem.bind(c);
  const removeItemOrig: (id: string) => void = c.removeItem.bind(c);
  const clearCartOrig: () => void = c.clearCart.bind(c);

  const notify = (): void => {
    events.emit(AppEvents.CART_UPDATED, {
      items: c.items.map((i: IProduct) => i.id),
      total: c.getTotal(),
      count: c.items.length,
    });
  };

  (c as unknown as { addItem: (prod: IProduct) => void }).addItem = (prod: IProduct): void => {
    const before: number = c.items.length;
    addItemOrig(prod);
    if (c.items.length !== before) notify();
  };

  (c as unknown as { removeItem: (id: string) => void }).removeItem = (id: string): void => {
    const before: number = c.items.length;
    removeItemOrig(id);
    if (c.items.length !== before) notify();
  };

  (c as unknown as { clearCart: () => void }).clearCart = (): void => {
    if (c.items.length === 0) return;
    clearCartOrig();
    notify();
  };
}

// ----- bootstrap
window.addEventListener('DOMContentLoaded', () => {
  void init();
});

async function init(): Promise<void> {
  console.debug('API_URL =', API_URL);

  // включаем декоратор для текущей корзины
  decorateCartWithEvents(cart);

  // статичный компонент корзины
  basketView = new Basket(cloneTemplate<HTMLDivElement>('#basket'), events);

  // подписки UI
  events.on('basket:open', () => openBasket());
  events.on('order:open', () => openOrderStep1());
  events.on('modal:open', () => (page.locked = true));
  events.on('modal:close', () => (page.locked = false));

  // корзина перерисовывается только по событию
  events.on(AppEvents.CART_UPDATED, () => {
    renderBasketFromModel();
    updateHeader();
  });

  // загрузка каталога
  const raw: unknown = await api.getProducts();
  const list: IProduct[] = Array.isArray(raw) ? (raw as IProduct[]) : [];
  products.setProducts(list);

  // первичный рендер
  renderCatalog();
  renderBasketFromModel();
  updateHeader();
}

// ----- каталог
function renderCatalog(): void {
  // если каталог пуст — View сам покажет пустое состояние
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
  const p: IProduct | undefined = products.getProduct(productId);
  if (!p) return;

  const inCart: boolean = cart.items.some((i: IProduct) => i.id === p.id);

  const previewCmp = new ProductCardPreview(
    cloneTemplate<HTMLDivElement>('#card-preview'),
    {
      onToggleCart: (id: string): void => {
        const prod: IProduct | undefined = products.getProduct(id);
        if (!prod) return;
        const already: boolean = cart.items.some((i: IProduct) => i.id === id);
        if (already) cart.removeItem(id);
        else cart.addItem(prod);

        // локально обновляем только превью для мгновенного фидбека
        previewCmp.render({ ...prod, inCart: !already });
        // остальной UI обновится по AppEvents.CART_UPDATED из декоратора
      },
    }
  );

  const previewEl: HTMLElement = previewCmp.render({ ...p, inCart });
  modal.render({ content: previewEl });
}

// ----- корзина
function renderBasketFromModel(): void {
  const itemsEls: HTMLElement[] = cart.items.map((p: IProduct, idx: number) =>
    buildBasketItem(p, idx + 1, (id: string): void => {
      // меняем только модель — событие перерисует корзину/хедер
      cart.removeItem(id);
    })
  );

  basketEl = basketView.render({
    items: itemsEls,
    total: cart.getTotal(),
    selected: cart.items.map((i: IProduct) => i.id),
  });
}

// Открыть корзину — просто показать уже отрисованный компонент
function openBasket(): void {
  modal.render({ content: basketEl });
}

// ----- оформление заказа (2 шага)
function openOrderStep1(): void {
  const formCmp = new OrderForm(
    cloneTemplate<HTMLFormElement>('#order'),
    events
  );

  const renderFromModel = (): void => {
    const addressOk: boolean = (order.address ?? '').trim().length > 3;
    const paymentOk: boolean = !!order.payment;
    formCmp.render({
      payment: order.payment ?? null,
      address: order.address ?? '',
      valid: addressOk && paymentOk,
      errors: addressOk ? '' : 'Необходимо указать адрес',
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
    const addressOk: boolean = (order.address ?? '').trim().length > 3;
    const paymentOk: boolean = !!order.payment;
    const valid: boolean = addressOk && paymentOk;

    if (!valid) {
      formCmp.render({
        payment: order.payment ?? null,
        address: order.address ?? '',
        valid,
        errors: addressOk ? '' : 'Необходимо указать адрес',
      });
      return;
    }
    openOrderStep2();
  });

  const formEl: HTMLElement = formCmp.render({
    payment: order.payment ?? null,
    address: order.address ?? '',
    valid: false,
    errors: '',
  });
  modal.render({ content: formEl });
}

function openOrderStep2(): void {
  const formCmp = new ContactsForm(
    cloneTemplate<HTMLFormElement>('#contacts'),
    events
  );

  events.on('contacts.email:change', (p: { field: 'email'; value: string }) => {
    order.setEmail(p.value);
  });
  events.on('contacts.phone:change', (p: { field: 'phone'; value: string }) => {
    order.setPhone(p.value);
  });

  events.on('contacts:submit', async () => {
    if (!order.validate()) {
      formCmp.errors = 'Проверьте адрес, способ оплаты, email/телефон';
      formCmp.render({ valid: false, errors: formCmp.errors });
      return;
    }

    const payload: OrderPayload = {
      payment: order.payment!,
      address: order.address,
      email: order.email,
      phone: order.phone,
      items: cart.items.map((i: IProduct) => i.id),
      total: cart.getTotal(), // сервер приоритетен и может пересчитать
    };

    try {
      // возможен ответ с total (если API это поддерживает)
      // @ts-ignore — совместимость, если метод типизирован как Promise<void>
      const res = await api.createOrder(payload);
      // @ts-ignore
      const totalFromServer: number | undefined = res?.total;

      const total: number = typeof totalFromServer === 'number'
        ? totalFromServer
        : cart.getTotal();

      cart.clearCart(); // вызовет CART_UPDATED из декоратора
      openSuccess(total);
    } catch (e) {
      console.error('Order failed', e);
      formCmp.errors = 'Не удалось оформить заказ. Попробуйте ещё раз.';
      formCmp.render({ valid: true, errors: formCmp.errors });
    }
  });

  const formEl: HTMLElement = formCmp.render({ valid: false, errors: '' });
  modal.render({ content: formEl });
}

function openSuccess(total: number): void {
  const successCmp = new SuccessView(cloneTemplate<HTMLDivElement>('#success'));
  const successEl: HTMLElement = successCmp.render({
    total,
    onClose: () => modal.close(),
  });
  modal.render({ content: successEl });
}

// ----- header
function updateHeader(): void {
  page.counter = cart.items.length;
}
