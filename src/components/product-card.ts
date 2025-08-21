import { ProductView, ProductViewData } from './product-view';
import { ensureElement } from '../utils/utils';

type Handlers = {
  onPreview: (id: string) => void;
};

export class ProductCard extends ProductView {
  private buttonEl: HTMLButtonElement;

  constructor(container: HTMLElement, private handlers: Handlers) {
    super(container);
    this.buttonEl = container as HTMLButtonElement;
    this.buttonEl.addEventListener('click', () => this.handlers.onPreview(this.id));
  }

  protected update(data: ProductViewData): void {
    super.update(data);
    // В каталоге карточка — это кнопка, цена и категория уже выставлены базовым
  }
}
