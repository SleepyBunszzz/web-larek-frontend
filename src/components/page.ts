import { Component } from './base/component';
import { ensureElement } from '../utils/utils';

export class Page extends Component<{ count: number }> {
  private counterEl: HTMLElement;
  private basketBtn: HTMLButtonElement;
  private gallery: HTMLElement;

  constructor(container: HTMLElement, handlers: { onOpenBasket: () => void }) {
    super(container);
    this.counterEl = ensureElement('.header__basket-counter');
    this.basketBtn = ensureElement<HTMLButtonElement>('.header__basket');
    this.gallery = ensureElement('.gallery');

    this.basketBtn.addEventListener('click', handlers.onOpenBasket);
  }

  get galleryEl() {
    return this.gallery;
  }

  setLocked(value: boolean) {
    document.body.style.overflow = value ? 'hidden' : '';
  }

  protected update(data: { count: number }): void {
    this.setText(this.counterEl, String(data.count));
  }
}
