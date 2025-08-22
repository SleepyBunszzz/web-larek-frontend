import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/common/page';
import { Modal } from './components/common/modal';
import { Basket } from './components/common/basket';
import { ProductCard } from './components/common/product-card';
import { ProductCardPreview } from './components/common/product-card-preview';
import { ProductModel } from './components/common/models/product-model';
import { CartModel } from './components/common/models/cart-model';
import { buildBasketItem } from './components/common/basket-item';

// инфраструктура
const events = new EventEmitter();
const page = new Page(document.body, events);
const modal = new Modal(ensureElement('#modal-container'), events);
const products = new ProductModel();
const cart = new CartModel();

function renderCatalog() {
  const cards = products.products.map(p => {
    const cmp = new ProductCard(
      cloneTemplate<HTMLButtonElement>('#card-catalog'),
      { onPreview: openPreview }
    );
    return cmp.render(p); // ← render у КЛАССА, всё ок
  });

  page.render({ counter: cart.items.length, catalog: cards, locked: false });
}

function openPreview(productId: string) {
  const p = products.getProduct(productId);
  if (!p) return;

  const inCart = cart.items.some(i => i.id === p.id);
  const cmp = new ProductCardPreview(
    cloneTemplate<HTMLDivElement>('#card-preview'),
    { onToggleCart: toggleCart }
  );
  modal.render({ content: cmp.render({ ...p, inCart }) });
}

function toggleCart(id: string) {
  const prod = products.getProduct(id);
  if (!prod) return;
  const already = cart.items.some(i => i.id === id);
  if (already) cart.removeItem(id); else cart.addItem(prod);
  page.counter = cart.items.length;
}

function openBasket() {
  const itemsEls = cart.items.map((p, idx) =>
    buildBasketItem(p, idx + 1, (id) => {
      cart.removeItem(id);
      page.counter = cart.items.length;
      openBasket(); // перерисовать
    })
  );

  const cmp = new Basket(cloneTemplate<HTMLDivElement>('#basket'), events);
  modal.render({
    content: cmp.render({
      items: itemsEls,
      total: cart.getTotal(),
      selected: cart.items.map(i => i.id)
    })
  });
}
