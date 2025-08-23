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

// ----- инфраструктура
const events = new EventEmitter();
const api = new CommerceAPI(API_URL, {});

const page = new Page(document.body, events);
const modal = new Modal(ensureElement('#modal-container'), events);

const products = new ProductModel();
const cart = new CartModel();
const order = new OrderModel();

// ----- bootstrap
window.addEventListener('DOMContentLoaded', () => {
  void init();
});

async function init(): Promise<void> {
  try {
    console.debug('API_URL =', API_URL);

    const raw = await api.getProducts();
    const list: IProduct[] = Array.isArray(raw) ? raw : [];
    console.debug('Loaded products:', list.length, list[0]);

    products.setProducts(list);

    renderCatalog();
    updateHeader();

    // события UI
    events.on('basket:open', () => openBasket());
    events.on('order:open', () => openOrderStep1());
    events.on('modal:open', () => (page.locked = true));
    events.on('modal:close', () => (page.locked = false));
  } catch (e) {
    console.error('Failed to load products', e);
  }
}

// ----- каталог
function renderCatalog(): void {
  try {
    ensureElement<HTMLTemplateElement>('#card-catalog');
  } catch (e) {
    console.error('Template #card-catalog не найден', e);
    return;
  }

  if (!products.products.length) {
    const empty = document.createElement('p');
    empty.className = 'gallery__empty';
    empty.textContent = 'Каталог пуст';
    page.render({ counter: cart.items.length, catalog: [empty], locked: false });
    return;
  }

  const cards = products.products.map((p) =>
    new ProductCard(
      cloneTemplate<HTMLButtonElement>('#card-catalog'),
      { onPreview: openPreview }
    ).render(p)
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

        updateHeader();
        previewCmp.render({ ...prod, inCart: !already });
      },
    }
  );

  const previewEl = previewCmp.render({ ...p, inCart });
  modal.render({ content: previewEl });
}

// ----- корзина
function openBasket(): void {
  try {
    ensureElement<HTMLTemplateElement>('#basket');
    ensureElement<HTMLTemplateElement>('#card-basket');
  } catch (e) {
    console.error('Template #basket или #card-basket не найден', e);
    return;
  }

  const itemsEls = cart.items.map((p, idx) =>
    buildBasketItem(p, idx + 1, (id) => {
      cart.removeItem(id);
      updateHeader();
      openBasket(); // перерисовать корзину
    })
  );

  const basketEl = new Basket(
    cloneTemplate<HTMLDivElement>('#basket'),
    events
  ).render({
    items: itemsEls,
    total: cart.getTotal(),
    selected: cart.items.map((i) => i.id),
  });

  modal.render({ content: basketEl });
}

// ----- оформление заказа (2 шага)
function openOrderStep1(): void {
  try {
    ensureElement<HTMLTemplateElement>('#order');
  } catch (e) {
    console.error('Template #order не найден', e);
    return;
  }

  const formCmp = new OrderForm(
    cloneTemplate<HTMLFormElement>('#order'),
    events
  );

  // Единая функция валидации шага 1 (адрес + способ оплаты)
  const validateStep1 = (): boolean => {
    const addressOk = order.address.trim().length > 3;
    const paymentOk = Boolean(order.payment);

    formCmp.errors = addressOk ? '' : 'Необходимо указать адрес';
    formCmp.valid = addressOk && paymentOk;

    return formCmp.valid;
  };

  events.on('order.address:change', (payload: { field: 'address'; value: string }) => {
    order.setAddress(payload.value);
    validateStep1();
  });

  events.on('order.address:changed', (payload: { payment: 'card' | 'cash'; address: string }) => {
    order.setPayment(payload.payment);
    order.setAddress(payload.address);
    validateStep1();
  });

  events.on('order:submit', () => {
    if (!validateStep1()) return;
    openOrderStep2();
  });

  const formEl = formCmp.render({ valid: false, errors: '' });
  modal.render({ content: formEl });
}

function openOrderStep2(): void {
  try {
    ensureElement<HTMLTemplateElement>('#contacts');
  } catch (e) {
    console.error('Template #contacts не найден', e);
    return;
  }

  const formCmp = new ContactsForm(
    cloneTemplate<HTMLFormElement>('#contacts'),
    events
  );

  events.on('contacts.name:change', (p: { field: 'name'; value: string }) => {
    order.setName(p.value);
  });
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
      name: order.name,
      email: order.email,
      phone: order.phone,
      items: cart.items.map((i) => i.id),
      total: cart.getTotal(),
    };

    try {
      await api.createOrder(payload);
      const total = cart.getTotal();
      cart.clearCart();
      updateHeader();
      openSuccess(total);
    } catch (e) {
      console.error('Order failed', e);
      formCmp.errors = 'Не удалось оформить заказ. Попробуйте ещё раз.';
      formCmp.render({ valid: true, errors: formCmp.errors });
    }
  });

  const formEl = formCmp.render({ valid: true, errors: '' });
  modal.render({ content: formEl });
}

function openSuccess(total: number): void {
  try {
    ensureElement<HTMLTemplateElement>('#success');
  } catch (e) {
    console.error('Template #success не найден', e);
    return;
  }

  const successCmp = new SuccessView(cloneTemplate<HTMLDivElement>('#success'));
  const successEl = successCmp.render({
    total,
    onClose: () => modal.close(),
  });
  modal.render({ content: successEl });
}

// ----- header
function updateHeader(): void {
  page.counter = cart.items.length;
}
