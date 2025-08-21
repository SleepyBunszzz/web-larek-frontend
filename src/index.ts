import './scss/styles.scss';

import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL } from './utils/constants';
import { CommerceAPI } from './api/commerce-api';
import { ProductModel } from './models/product-model';
import { CartModel } from './models/cart-model';
import { OrderModel } from './models/order-model';

import { Page } from './components/page';
import { Modal } from './components/modal';
import { ProductCard } from './components/product-card';
import { ProductCardPreview } from './components/product-card-preview';
import { Basket } from './components/basket/basket';
import { OrderForm } from './components/forms/order-form';
import { ContactsForm } from './components/forms/contacts-form';
import { SuccessView } from './components/forms/success';

import { IProduct, OrderPayload } from './types';

// ----- helpers
const formatPrice = (n: number) => `${n.toLocaleString('ru-RU')} синапсов`;

// ----- core instances
const api = new CommerceAPI(API_URL, {});
const page = new Page(document.body, {
  onOpenBasket: openBasket,
});
const modal = new Modal(ensureElement('#modal-container'));

// data
const products = new ProductModel();
const cart = new CartModel();
const order = new OrderModel();

// ----- bootstrap
init();

async function init() {
  const list = await api.getProducts();
  products.setProducts(list);
  renderCatalog();
  updateHeader();
}

// ----- UI renderers

function renderCatalog() {
  const gallery = page.galleryEl;
  gallery.innerHTML = '';

  products.products.forEach((p) => {
    const card = new ProductCard(
      cloneTemplate<HTMLButtonElement>('#card-catalog'),
      { onPreview: openPreview }
    ).render(p);

    gallery.append(card);
  });
}

function openPreview(productId: string) {
  const p = products.getProduct(productId);
  if (!p) return;

  const inCart = cart.items.some((i) => i.id === p.id);

  const view = new ProductCardPreview(
    cloneTemplate<HTMLDivElement>('#card-preview'),
    {
      onToggleCart: (id: string) => {
        const prod = products.getProduct(id);
        if (!prod) return;
        const already = cart.items.some((i) => i.id === id);
        if (already) cart.removeItem(id);
        else cart.addItem(prod);
        updateHeader();
        // перерисовать предпросмотр
        view.render({ ...prod, inCart: !already });
      },
    }
  ).render({ ...p, inCart });

  modal.open(view);
}

function openBasket() {
  const basket = new Basket(
    cloneTemplate<HTMLDivElement>('#basket'),
    {
      onRemove: (id) => {
        cart.removeItem(id);
        modal.content = new Basket(
          cloneTemplate<HTMLDivElement>('#basket'),
          {
            onRemove: (i: string) => {
              cart.removeItem(i);
              openBasket();
              updateHeader();
            },
            onCheckout: openOrderStep1,
          }
        ).render({ items: cart.items, total: cart.getTotal() });
        updateHeader();
      },
      onCheckout: openOrderStep1,
    }
  ).render({ items: cart.items, total: cart.getTotal() });

  modal.open(basket);
}

function openOrderStep1() {
  const form = new OrderForm(
    cloneTemplate<HTMLFormElement>('#order'),
    {
      onChange: ({ payment, address }) => {
        order.setPayment(payment);
        order.setAddress(address);
      },
      onSubmit: () => {
        // валидация первого шага
        const ok = order.address.trim().length > 3 && !!order.payment;
        if (!ok) return;
        openOrderStep2();
      },
    }
  );
  modal.content = form.render();
}

function openOrderStep2() {
  const form = new ContactsForm(
    cloneTemplate<HTMLFormElement>('#contacts'),
    {
      onChange: ({ name, email, phone }) => {
        // имя может отсутствовать в форме — хранится в модели
        order.setName(name);
        order.setEmail(email);
        order.setPhone(phone);
      },
      onSubmit: async () => {
        // финальная валидация модели
        if (!order.validate()) return;

        const payload: OrderPayload = {
          payment: order.payment,
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
          form.setError(String(e));
        }
      },
    }
  );
  modal.content = form.render();
}

function openSuccess(total: number) {
  const success = new SuccessView(
    cloneTemplate<HTMLDivElement>('#success')
  ).render({
    total,
    onClose: () => modal.close(),
  });
  modal.content = success;
}

function updateHeader() {
  page.render({ count: cart.items.length });
}
