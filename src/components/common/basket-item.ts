import { cloneTemplate, ensureElement, formatNumber } from '../../utils/utils';
import type { IProduct } from '../../types';

/**
 * Собирает <li> для корзины из шаблона #card-basket
 * и вешает обработчик удаления.
 */
export function buildBasketItem(
  product: IProduct,
  index: number,
  onDelete: (id: string) => void
): HTMLElement {
  const el = cloneTemplate<HTMLLIElement>('#card-basket');

  // Порядковый номер
  ensureElement<HTMLElement>('.basket__item-index', el).textContent = String(index);

  // Название и цена
  ensureElement<HTMLElement>('.card__title', el).textContent = product.name;
  ensureElement<HTMLElement>('.card__price', el).textContent = formatNumber(product.cost);

  // Кнопка удаления (в твоей разметке есть оба варианта классов)
  const deleteBtn = el.querySelector<HTMLButtonElement>('.basket__item-delete, .card__button');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => onDelete(product.id));
  }

  return el;
}
