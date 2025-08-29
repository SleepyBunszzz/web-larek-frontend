import type { IProduct } from '../../types';
import { BaseProductCard } from './product-card';
import { formatNumber } from '../../utils/utils';

type PreviewData = IProduct & { inCart?: boolean };
type PreviewProps = { onToggleCart: (id: string) => void };

export class ProductCardPreview extends BaseProductCard<PreviewData> {
  private text?: HTMLElement;
  private btn?: HTMLButtonElement;

  constructor(container: HTMLElement, private props: PreviewProps) {
    super(container);

    this.text = this.el.querySelector('.card__text, .card__description') ?? undefined;
    this.btn = this.el.querySelector<HTMLButtonElement>('.card__button, [data-role="toggle-cart"]') ?? undefined;

    this.btn?.addEventListener('click', () => {
      if (this._id) this.props.onToggleCart(this._id);
    });
  }

  render(data: PreviewData): HTMLElement {
    super.render(data);

    this.applyBase(data);

    if (this.text) this.setText(this.text, data.desc || '');

    const priceText = data.cost > 0 ? formatNumber(data.cost) : 'Бесценно';
    this.setText(this.price, priceText);

    if (this.btn) {
      if (data.cost <= 0) {
        this.setText(this.btn, 'Недоступно'); 
        this.setDisabled(this.btn, true);
        this.btn.classList.add('is-disabled');
      } else {
        this.setDisabled(this.btn, false);
        this.btn.classList.remove('is-disabled');
        this.setText(this.btn, data.inCart ? 'Убрать из корзины' : 'Купить');
      }
    }

    return this.el;
  }
}
