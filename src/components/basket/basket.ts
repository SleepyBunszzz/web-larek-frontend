// src/components/basket/basket.ts
import { Component } from '../base/component';
import { ensureElement, cloneTemplate } from '../../utils/utils';
import { IProduct } from '../../types';
import { BasketItem } from './basket-item';

type Handlers = {
  onRemove: (id: string) => void;
  onCheckout: () => void;
};

export class Basket extends Component<{ items: IProduct[]; total: number }> {
  private listEl: HTMLElement;
  private totalEl: HTMLElement;
  private orderBtn: HTMLButtonElement;

  constructor(container: HTMLElement, private handlers: Handlers) {
    super(container);

    this.listEl = ensureElement<HTMLElement>('.basket__list', container);
    this.totalEl = ensureElement<HTMLElement>('.basket__price', container);
    this.orderBtn = ensureElement<HTMLButtonElement>('.basket__button', container);

    this.orderBtn.addEventListener('click', () => this.handlers.onCheckout());
  }

  protected update(data: { items: IProduct[]; total: number }) {
    // очистить список
    this.listEl.innerHTML = '';

    // добавить строки
    data.items.forEach((p, idx) => {
      const row = new BasketItem(
        cloneTemplate<HTMLLIElement>('#card-basket'),
        { onDelete: this.handlers.onRemove }
      ).render({
        id: p.id,
        index: idx + 1,
        title: p.name,
        price: `${(p.cost ?? 0).toLocaleString('ru-RU')} синапсов`,
      });

      this.listEl.append(row);
    });

    // обновить сумму и состояние кнопки
    this.setText(this.totalEl, `${data.total.toLocaleString('ru-RU')} синапсов`);
    this.setDisabled(this.orderBtn, data.items.length === 0);
  }
}

