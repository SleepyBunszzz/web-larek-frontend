import { Component } from '../base/component';
import { IProduct } from '../../types';
import { formatNumber } from '../../utils/utils';

type ProductCardProps = {
  onPreview?: (id: string) => void;
};

export class ProductCard extends Component<IProduct> {
  private title?: HTMLElement;
  private category?: HTMLElement;
  private price?: HTMLElement;
  private image?: HTMLImageElement;

  constructor(container: HTMLElement, private props: ProductCardProps = {}) {
    super(container);

    this.title = container.querySelector('.card__title') ?? undefined;
    this.category = container.querySelector('.card__category') ?? undefined;
    this.price = container.querySelector('.card__price') ?? undefined;
    this.image = container.querySelector<HTMLImageElement>('.card__image') ?? undefined;

    this.el.addEventListener('click', () => {
      const id = this.el.dataset.id;
      if (id && this.props.onPreview) this.props.onPreview(id);
    });
  }

  render(data: IProduct): HTMLElement {
    this.el.dataset.id = data.id;

    this.setText(this.title, data.name);
    this.setText(this.category, data.category);
    this.setText(this.price, formatNumber(data.cost));
    this.setImage(this.image, data.img_url, data.name);

    return this.el;
  }
}
