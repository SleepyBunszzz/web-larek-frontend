import type { IProduct } from '../../types';
import { BaseProductCard } from './product-card';
import { ensureElement, formatNumber, cloneTemplate } from '../../utils/utils';

type BasketItemProps = {
  index: number;
  onDelete: (id: string) => void;
};

export class BasketItemView extends BaseProductCard<IProduct> {
  private indexEl: HTMLElement;
  private deleteBtn: HTMLButtonElement | null;

  constructor(container: HTMLElement, private props: BasketItemProps) {
    super(container);

    this.indexEl = ensureElement<HTMLElement>('.basket__item-index', this.el);
    this.deleteBtn = this.el.querySelector<HTMLButtonElement>('.basket__item-delete, .card__button') ?? null;

    this.deleteBtn?.addEventListener('click', () => {
      if (this._id) this.props.onDelete(this._id);
    });
  }

  render(data: IProduct): HTMLElement {
    super.render(data);
    this.applyBase(data);

    this.setText(this.price, formatNumber(data.cost));
    this.indexEl.textContent = String(this.props.index);

    return this.el;
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
