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

// ---- флаги показа ошибок на шагах
let step1ShowErrors = false; // шаг 1: адрес + способ оплаты
let step2ShowErrors = false; // шаг 2: контакты

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
      renderBasketFromModel();
      updateHeader();
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
          renderBasketFromModel();
          updateHeader();
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
    showErrors: false, // скрываем ошибки до сабмита/клика
  });

  step1ShowErrors = false; // сброс флага при открытии шага
  modal.render({ content: formEl });
}

function openOrderStep2(): void {
  const state = order.toContactsFormState();
  const el = contactsForm.render({ ...state, showErrors: false }); // скрыть до сабмита
  step2ShowErrors = false; // сброс флага при открытии
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

  // обновление корзины
  cart.on('cart:changed', () => {
    renderBasketFromModel();
    updateHeader();
  });

  // изменение адреса и (по желанию) одновременная установка оплаты
  events.on(
    AppEvents.ORDER_ADDRESS_CHANGED ?? ('order:address:changed' as any),
    ({ payment, address }: { payment: 'card' | 'cash' | null; address: string }) => {
      if (payment) order.setPayment(payment);
      if (typeof address === 'string') order.setAddress(address);

      // const s1 = order.validateStep1();
      // orderForm.render({
      //   payment: order.payment ?? null,
      //   address: order.address ?? '',
      //   valid: s1.valid,
      //   errors: s1.errors,
      //   showErrors: step1ShowErrors, // показываем ошибки, только если включён флаг
      // });
    }
  );

  // пользователь выбрал способ оплаты
  events.on(AppEvents.ORDER_PAYMENT_SELECTED, ({ payment }: { payment: 'card' | 'cash' }) => {

    // если адрес пуст — разрешаем показать ошибку сразу
    if (!(order.address ?? '').trim()) step1ShowErrors = true;
    order.setPayment(payment);
    // const s1 = order.validateStep1();
    // orderForm.render({
    //   payment: order.payment ?? null,
    //   address: order.address ?? '',
    //   valid: s1.valid,
    //   errors: s1.errors,
    //   showErrors: step1ShowErrors, // теперь сообщение об адресе появится
    // });
  });

  // сабмит шага 1
  events.on(AppEvents.ORDER_SUBMITTED ?? ('order:submitted' as any), () => {
    const res = order.validateStep1();
    if (!res.valid) {
      step1ShowErrors = true; 
      orderForm.render({
        payment: order.payment ?? null,
        address: order.address ?? '',
        valid: res.valid,
        errors: res.errors,
        showErrors: true,
      });
      return;
    }

    openOrderStep2();
  });

  // контакты: изменения инпутов
events.on('contacts.email:change', (p: { field: 'email'; value: string }) => {
  order.setEmail(p.value);
  events.emit('order:changed');
});
events.on('contacts.phone:change', (p: { field: 'phone'; value: string }) => {
  order.setPhone(p.value);
  events.emit('order:changed');
});
events.on('contacts.name:change', (p: { field: 'name'; value: string }) => {
  order.setName(p.value);
  events.emit('order:changed');
});


  // сабмит шага 2 (оплата)
  events.on('contacts:submit', async () => {
    const res = order.validateContacts();
    if (!res.valid) {
      step2ShowErrors = true;
      contactsForm.render({
        ...order.toContactsFormState(),
        valid: false,
        errors: res.errors || 'Заполните все поля формы',
        showErrors: true,
      });
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
      await api.createOrder(payload);
      const total = cart.getTotal();

      cart.clearCart();
      order.reset();

      renderBasketFromModel();
      updateHeader();
      openSuccess(total);
    } catch (e) {
      console.error('Order failed', e);
      contactsForm.render({
        ...order.toContactsFormState(),
        valid: true,
        errors: 'Не удалось оформить заказ. Попробуйте ещё раз.',
        showErrors: true, // показать ошибку оплаты
      });
    }
  });

  // универсальный перерисовщик состояния заказа — НЕ скрывает ошибки насильно
  order.on('order:changed', () => {
    const s1 = order.validateStep1();
    orderForm.render({
      payment: order.payment ?? null,
      address: order.address ?? '',
      valid: s1.valid,
      errors: s1.errors,
      showErrors: step1ShowErrors,
    });

    const s2 = order.toContactsFormState();
    contactsForm.render({
      ...s2,
      showErrors: step2ShowErrors,
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
    const productsList = await api.getProducts() as IProduct[];
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
