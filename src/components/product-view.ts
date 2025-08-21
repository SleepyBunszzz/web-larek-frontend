import { Component } from './base/component';
import { IProduct } from '../types';

export type ProductViewData = IProduct & { inCart?: boolean };

export abstract class ProductView extends Component<ProductViewData> {
  protected _id!: string;
  protected elTitle?: HTMLElement;
  protected elCategory?: HTMLElement;
  protected elPrice?: HTMLElement;
  protected elImage?: HTMLImageElement;

  constructor(container: HTMLElement) {
    super(container);
    this.elTitle = container.querySelector<HTMLElement>('.card__title') ?? undefined;
    this.elCategory = container.querySelector<HTMLElement>('.card__category') ?? undefined;
    this.elPrice = container.querySelector<HTMLElement>('.card__price') ?? undefined;
    this.elImage = container.querySelector<HTMLImageElement>('.card__image') ?? undefined;
  }

  get id() {
    return this._id;
  }

  protected formatPrice(cost?: number) {
    if (typeof cost !== 'number') return '';
    return `${cost.toLocaleString('ru-RU')} синапсов`;
  }

  protected update(data: ProductViewData): void {
    this._id = data.id;

    if (this.elTitle) this.setText(this.elTitle, data.name);
    if (this.elCategory) this.setText(this.elCategory, data.category);
    if (this.elPrice) this.setText(this.elPrice, this.formatPrice(data.cost));
    if (this.elImage && data.img_url) this.setImage(this.elImage, data.img_url, data.name);
  }
}
