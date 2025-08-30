// src/index.ts
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

// ---- глобальные экземпляры
const events = new EventEmitter();
const api = new CommerceAPI(API_URL, {});
const page = new Page(document.body, events);
const modal = new Modal(ensureElement('#modal-container'), events);
const products = new ProductModel();
const cart = new CartModel();
const order = new OrderModel();

const basketView   = new Basket(cloneTemplate<HTMLDivElement>('#basket'), events);
const orderForm    = new OrderForm(cloneTemplate<HTMLFormElement>('#order'), events);
const contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>('#contacts'), events);
const successView  = new SuccessView(cloneTemplate<HTMLDivElement>('#success'));

// ---- рендеры каталога/корзины/шапки
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

function renderBasketFromModel(): void {
  const itemsEls: HTMLElement[] = cart.items.map((p, idx) =>
    buildBasketItem(p, idx + 1, (id: string): void => {
      cart.removeItem(id);
    })
  );

  basketView.render({
    items: itemsEls,
    total: cart.getTotal(),
    selected: cart.items.map((i) => i.id),
  });
}

function updateHeader(): void {
  page.counter = cart.items.length;
}

// ---- модалки
function openBasket(): void {
  modal.render({
    content: basketView.render({
      items: cart.items.map((p, idx) =>
        buildBasketItem(p, idx + 1, (id: string) => {
          cart.removeItem(id);
        })
      ),
      total: cart.getTotal(),
      selected: cart.items.map((i) => i.id),
    }),
  });
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

function openOrderStep1(): void {
  if (!order.payment) order.setPayment('card');

  const res = order.validateStep1();
  const formEl = orderForm.render({
    payment: order.payment ?? null,
    address: order.address ?? '',
    valid: res.valid,
    errors: res.errors,
    showErrors: false,
  });

  order.setStep1ShowErrors(false);
  modal.render({ content: formEl });
}

function openOrderStep2(): void {
  const state = order.toContactsFormState();
  const el = contactsForm.render({ ...state, showErrors: false });
  order.setStep2ShowErrors(false);
  modal.render({ content: el });
}

function openSuccess(total: number): void {
  const successEl = successView.render({
    total,
    onClose: () => modal.close(),
  });
  modal.render({ content: successEl });
}

// ---- биндим глобальные обработчики
function bindGlobalHandlersOnce(): void {
  // системные/страничные события
  events.on('basket:open', () => openBasket());
  events.on('order:open', () => openOrderStep1());
  events.on('modal:open', () => (page.locked = true));
  events.on('modal:close', () => (page.locked = false));

  // обновление корзины (enum вместо «магической» строки)
  cart.on(AppEvents.CART_CHANGED, () => {
    renderBasketFromModel();
    updateHeader();
  });

  // изменение адреса и (по желанию) одновременная установка оплаты
  events.on(
    AppEvents.ORDER_ADDRESS_CHANGED,
    ({ payment, address }: { payment?: 'card' | 'cash' | null; address: string }) => {
      if (payment) order.setPayment(payment);
      if (typeof address === 'string') order.setAddress(address);
    }
  );

  // пользователь выбрал способ оплаты
  events.on(AppEvents.ORDER_PAYMENT_SELECTED, ({ payment }: { payment: 'card' | 'cash' }) => {
    if (!(order.address ?? '').trim()) order.setStep1ShowErrors(true);
    order.setPayment(payment);
  });

  // сабмит шага 1
  events.on(AppEvents.ORDER_SUBMITTED, () => {
    const res = order.validateStep1();
    if (!res.valid) {
      order.setStep1ShowErrors(true);
      orderForm.render({
        payment: order.payment ?? null,
        address: order.address ?? '',
        valid: res.valid,
        errors: res.errors,
        showErrors: true,
      });
      return;
    }
    order.setStep1ShowErrors(false);
    openOrderStep2();
  });

  // контакты: изменения инпутов
  events.on('contacts.email:change', (p: { field: 'email'; value: string }) => {
    order.setEmail(p.value);
  });
  events.on('contacts.phone:change', (p: { field: 'phone'; value: string }) => {
    order.setPhone(p.value);
  });

  // «первое действие» на шаге 2 — blur любого поля
  events.on('contacts.field:blur', (p: { field: 'email' | 'phone' }) => {
    order.setLastContactsBlur(p.field);
    const invalid = !order.validateContacts(p.field).valid;
    if (invalid) order.setStep2ShowErrors(true);
  });

  // сабмит шага 2 (оплата) — защита от повторной отправки
  let isSubmitting = false;
  events.on('contacts:submit', async () => {
    if (isSubmitting) return;

    const res = order.validateContacts();
    if (!res.valid) {
      order.setStep2ShowErrors(true);
      contactsForm.render({
        ...order.toContactsFormState(),
        valid: false,
        errors: res.errors || 'Заполните все поля формы',
        showErrors: true,
      });
      return;
    }

    isSubmitting = true;
    // временно отключаем кнопку «Оплатить» на время запроса
    contactsForm.valid = false;

    const payload: OrderPayload = {
      payment: order.payment!,
      address: order.address,
      email:   order.email,
      phone:   order.phone,
      items:   cart.items.map((i: IProduct) => i.id),
      total:   cart.getTotal(),
    };

    try {
      const resp = await api.createOrder(payload);
      const totalFromServer = resp?.total ?? cart.getTotal();

      cart.clearCart();
      order.reset();

      renderBasketFromModel();
      updateHeader();
      openSuccess(totalFromServer);
    } catch (e) {
      console.error('Order failed', e);
      contactsForm.render({
        ...order.toContactsFormState(),
        valid: true,
        errors: 'Не удалось оформить заказ. Попробуйте ещё раз.',
        showErrors: true,
      });
    } finally {
      isSubmitting = false;
      // восстановим доступность кнопки по актуальной валидности модели
      const v = order.validateContacts();
      contactsForm.valid = v.valid;
    }
  });

  // универсальный перерисовщик
  order.on('order:changed', () => {
    const s1 = order.validateStep1();
    orderForm.render({
      payment: order.payment ?? null,
      address: order.address ?? '',
      valid: s1.valid,
      errors: s1.errors,
      showErrors: order.step1ShowErrors,
    });

    const s2 = order.toContactsFormState();
    contactsForm.render({
      ...s2,
      showErrors: order.step2ShowErrors,
    });
  });
}

// ---- инициализация
window.addEventListener('DOMContentLoaded', () => {
  void init();
});

async function init(): Promise<void> {
  bindGlobalHandlersOnce();

  try {
    const productsList = await api.getProducts();
    products.setProducts(productsList);

    renderCatalog();
    renderBasketFromModel();
    updateHeader();
  } catch (e) {
    console.error('Failed to load products', e);
    products.setProducts([]);
    renderCatalog();
  }
}
