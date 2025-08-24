// src/components/common/product-card.ts
import { Component } from '../base/component';
import type { IProduct } from '../../types';
import { formatNumber, categoryClass } from '../../utils/utils';

type ProductCardProps = {
  onPreview?: (id: string) => void;
};

/**
 * БАЗОВЫЙ класс отображения товара.
 * ВАЖНО: расположен в этом же файле, отдельный файл не создаём.
 */
export abstract class BaseProductCard<TData extends IProduct> extends Component<TData> {
  protected _id: string | null = null;

  protected title?: HTMLElement;
  protected category?: HTMLElement;
  protected price?: HTMLElement;
  protected image?: HTMLImageElement;

  constructor(container: HTMLElement) {
    super(container);

    this.title = this.el.querySelector('.card__title') ?? undefined;
    this.category = this.el.querySelector('.card__category') ?? undefined;
    this.price = this.el.querySelector('.card__price') ?? undefined;
    this.image = this.el.querySelector<HTMLImageElement>('.card__image') ?? undefined;
  }

  /** Общая отрисовка базовых полей товара */
  protected applyBase(data: IProduct) {
    this._id = data.id;

    this.setText(this.title, data.name);
    this.setText(this.price, formatNumber(data.cost));
    this.setImage(this.image, data.img_url, data.name);

    if (this.category) {
      this.setText(this.category, data.category);
      // сбрасываем модификаторы и ставим нужный под категорию
      this.category.className = 'card__category';
      const cls = categoryClass(data.category);
      if (cls) this.category.classList.add(cls);
    }
  }
}

/** Карточка товара в каталоге */
export class ProductCard extends BaseProductCard<IProduct> {
  constructor(container: HTMLElement, private props: ProductCardProps = {}) {
    super(container);

    // По клику уведомляем презентер (НЕ храним id в dataset)
    this.el.addEventListener('click', () => {
      if (this._id && this.props.onPreview) this.props.onPreview(this._id);
    });
  }

  render(data: IProduct): HTMLElement {
    super.render(data);
    this.applyBase(data);
    return this.el;
  }
}

