import { cloneTemplate, ensureElement, formatNumber } from '../../utils/utils';
import type { IProduct } from '../../types';


export function buildBasketItem(
  product: IProduct,
  index: number,
  onDelete: (id: string) => void
): HTMLElement {
  const el = cloneTemplate<HTMLLIElement>('#card-basket');

  ensureElement<HTMLElement>('.basket__item-index', el).textContent = String(index);

  ensureElement<HTMLElement>('.card__title', el).textContent = product.name;
  ensureElement<HTMLElement>('.card__price', el).textContent = formatNumber(product.cost);

  const deleteBtn = el.querySelector<HTMLButtonElement>('.basket__item-delete, .card__button');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => onDelete(product.id));
  }

  return el;
}
