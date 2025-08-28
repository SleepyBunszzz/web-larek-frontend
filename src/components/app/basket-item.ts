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

    this.indexEl = ensureElement<HTMLElement>('.basket__item-index', this.el);
    this.titleEl = ensureElement<HTMLElement>('.card__title', this.el);
    this.priceEl = ensureElement<HTMLElement>('.card__price', this.el);
    this.deleteBtn =
      this.el.querySelector<HTMLButtonElement>('.basket__item-delete, .card__button') ?? null;

    this.deleteBtn?.addEventListener('click', () => {
      if (this._id) this.props.onDelete(this._id);
    });
  }

  render(data: IProduct): HTMLElement {
    this._id = (data as any).id ?? (data as any)._id ?? null;
    const title = (data as any).title ?? (data as any).name ?? '';
    this.setText(this.titleEl, title);
    const priceNum = (data as any).price ?? (data as any).cost;
    this.setText(this.priceEl, typeof priceNum === 'number' ? formatNumber(priceNum) : '');
    this.setText(this.indexEl, String(this.props.index));

    return this.el;
  }

  get id(): string | null {
    return this._id;
  }
}

export function buildBasketItem(
  product: IProduct,
  index: number,
  onDelete: (id: string) => void
): HTMLElement {
  const el = cloneTemplate<HTMLLIElement>('#card-basket');
  return new BasketItemView(el, { index, onDelete }).render(product);
}
