// src/components/app/basket-item.ts
import { Component } from '../common/base/component';
import type { IProduct } from '../../types';
import { ensureElement, formatNumber, cloneTemplate } from '../../utils/utils';

type BasketItemProps = {
  index: number;
  onDelete: (id: string) => void;
};

export class BasketItemView extends Component<IProduct> {
  private titleEl: HTMLElement;
  private priceEl: HTMLElement;
  private indexEl: HTMLElement;
  private deleteBtn: HTMLButtonElement | null;

  private _id: string | null = null;

  constructor(container: HTMLElement, private props: BasketItemProps) {
    super(container);

    // селекторы соответствуют <template id="card-basket">
    this.indexEl = ensureElement<HTMLElement>('.basket__item-index', this.el);
    this.titleEl = ensureElement<HTMLElement>('.card__title', this.el);
    this.priceEl = ensureElement<HTMLElement>('.card__price', this.el);
    this.deleteBtn =
      this.el.querySelector<HTMLButtonElement>('.basket__item-delete, .card__button') ?? null;

    // подписка один раз
    this.deleteBtn?.addEventListener('click', () => {
      if (this._id) this.props.onDelete(this._id);
    });
  }

  render(data: IProduct): HTMLElement {
    // сохраняем id для onDelete
    // поддержим оба поля: id / _id
    this._id = (data as any).id ?? (data as any)._id ?? null;

    // title: поддержим и name, и title
    const title = (data as any).title ?? (data as any).name ?? '';
    this.setText(this.titleEl, title);

    // price: поддержим и price, и cost
    const priceNum = (data as any).price ?? (data as any).cost;
    this.setText(this.priceEl, typeof priceNum === 'number' ? formatNumber(priceNum) : '');

    // ❗ замечание ревьюера №2 — используем метод родителя
    this.setText(this.indexEl, String(this.props.index));

    return this.el;
  }

  get id(): string | null {
    return this._id;
  }
}

// Фабрика остаётся той же — внешний код не меняем.
// В проекте реально существует <template id="card-basket"> — см. index.html
export function buildBasketItem(
  product: IProduct,
  index: number,
  onDelete: (id: string) => void
): HTMLElement {
  const el = cloneTemplate<HTMLLIElement>('#card-basket');
  return new BasketItemView(el, { index, onDelete }).render(product);
}
