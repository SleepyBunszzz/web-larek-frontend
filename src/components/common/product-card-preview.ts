import { Component } from '../base/component';
import { IProduct } from '../../types';
import { formatNumber } from '../../utils/utils';

type PreviewData = IProduct & { inCart?: boolean };
type PreviewProps = { onToggleCart: (id: string) => void };

export class ProductCardPreview extends Component<PreviewData> {
  private title?: HTMLElement;
  private text?: HTMLElement;
  private price?: HTMLElement;
  private image?: HTMLImageElement;
  private btn?: HTMLButtonElement;
  private category?: HTMLElement;

  constructor(container: HTMLElement, private props: PreviewProps) {
    super(container);

    this.title = container.querySelector('.card__title') ?? undefined;
    this.text = container.querySelector('.card__text, .card__description') ?? undefined;
    this.price = container.querySelector('.card__price') ?? undefined;
    this.image = container.querySelector<HTMLImageElement>('.card__image') ?? undefined;
    this.category = container.querySelector('.card__category') ?? undefined;
    this.btn = container.querySelector<HTMLButtonElement>('.card__button, [data-role="toggle-cart"]') ?? undefined;

    this.btn?.addEventListener('click', () => {
      const id = this.el.dataset.id;
      if (id) this.props.onToggleCart(id);
    });
  }

  render(data: PreviewData): HTMLElement {
    this.el.dataset.id = data.id;

    this.setText(this.title, data.name);
    this.setText(this.text, data.desc || '');
    this.setText(this.price, formatNumber(data.cost));
    this.setText(this.category, data.category);
    this.setImage(this.image, data.img_url, data.name);

    if (this.btn) this.btn.textContent = data.inCart ? 'Убрать из корзины' : 'В корзину';

    return this.el;
  }
}
