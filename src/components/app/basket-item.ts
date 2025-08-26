import { Component } from '../common/base/component'; // <-- ВАЖНО: путь из /app к /common
import type { IProduct } from '../../types';
import { formatNumber, cloneTemplate } from '../../utils/utils';

type BasketItemProps = {
  index: number;
  onDelete: (id: string) => void;
};

/**
 * Элемент корзины.
 * Исправления по ревью:
 * - не наследуемся от BaseProductCard (его функционал в корзине не используется);
 * - используем методы базового Component вместо дублирования DOM-логики.
 */
export class BasketItemView extends Component {
  private titleEl: HTMLElement | null;
  private priceEl: HTMLElement | null;
  private indexEl: HTMLElement | null;
  private deleteBtn: HTMLButtonElement | null;

  constructor(container: HTMLElement, private props: BasketItemProps) {
    super(container);

    this.titleEl   = this.el.querySelector('.card__title');
    this.priceEl   = this.el.querySelector('.card__price');
    this.indexEl   = this.el.querySelector('.basket__item-index');
    this.deleteBtn = this.el.querySelector('.basket__item-delete, .card__button');

    this.deleteBtn?.addEventListener('click', () => {
      const id = this.el.getAttribute('data-id'); // актуальный id берём из DOM
      if (id) this.props.onDelete(id);
    });
  }

  // super.render(data) вызовет update(data)
  render(data: IProduct): HTMLElement {
    return super.render(data);
  }

  // единственное место, где мы применяем данные к DOM
  protected update(data?: unknown): void {
    const product = data as IProduct;

    // храним id в атрибуте, чтобы хендлер удаления всегда читал актуальное значение
    this.el.setAttribute('data-id', product.id);

    // используем хелперы родителя — не дублируем textContent и т.п.
    this.setText(this.titleEl, product.name);
    this.setText(this.priceEl, formatNumber(product.cost));
    this.setText(this.indexEl, this.props.index); // <-- было textContent = ...
  }
}

/** Фабрика элемента корзины из шаблона */
export function buildBasketItem(
  product: IProduct,
  index: number,
  onDelete: (id: string) => void
): HTMLElement {
  const el = cloneTemplate<HTMLLIElement>('#card-basket');
  return new BasketItemView(el, { index, onDelete }).render(product);
}
