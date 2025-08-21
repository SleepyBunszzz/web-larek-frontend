// src/components/basket/basket-item.ts
import { Component } from '../base/component';

export type BasketItemData = {
  index: number;
  id: string;
  title: string;
  price: string;
};

type Handlers = {
  onDelete: (id: string) => void;
};

export class BasketItem extends Component<BasketItemData> {
  private idxEl: HTMLElement;
  private titleEl: HTMLElement;
  private priceEl: HTMLElement;
  private delBtn: HTMLButtonElement;

  private id!: string;

  constructor(container: HTMLElement, private handlers: Handlers) {
    super(container);

    // Лучше типизировать querySelector и падать с понятной ошибкой,
    // чем потом ловить undefined:
    const idx = container.querySelector<HTMLElement>('.basket__item-index');
    const title = container.querySelector<HTMLElement>('.card__title');
    const price = container.querySelector<HTMLElement>('.card__price');
    // Поддерживаем обе разметки: кнопка удаления в строке корзины и card__button:
    const del =
      container.querySelector<HTMLButtonElement>('.basket__item-delete') ??
      container.querySelector<HTMLButtonElement>('.card__button');

    if (!idx || !title || !price || !del) {
      throw new Error('[BasketItem] Broken template: missing required elements');
    }

    this.idxEl = idx;
    this.titleEl = title;
    this.priceEl = price;
    this.delBtn = del;

    this.delBtn.addEventListener('click', () => this.handlers.onDelete(this.id));
  }

  protected update(data: BasketItemData): void {
    this.id = data.id;
    this.setText(this.idxEl, String(data.index));
    this.setText(this.titleEl, data.title);
    this.setText(this.priceEl, data.price);
  }
}

