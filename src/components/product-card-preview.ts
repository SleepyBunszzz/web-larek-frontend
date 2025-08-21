import { ProductView, ProductViewData } from './product-view';
import { ensureElement } from '../utils/utils';

type Handlers = {
  onToggleCart: (id: string) => void;
};

export class ProductCardPreview extends ProductView {
  private btn: HTMLButtonElement;
  private descEl?: HTMLElement;

  constructor(container: HTMLElement, private handlers: Handlers) {
    super(container);
    this.btn = ensureElement<HTMLButtonElement>('.card__button', container);
    this.descEl = container.querySelector('.card__text') || undefined as any;

    this.btn.addEventListener('click', () => this.handlers.onToggleCart(this.id));
  }

  protected update(data: ProductViewData): void {
    super.update(data);
    if (this.descEl) this.setText(this.descEl, data.desc ?? '');
    this.setText(this.btn, data.inCart ? 'Убрать' : 'В корзину');
  }
}
