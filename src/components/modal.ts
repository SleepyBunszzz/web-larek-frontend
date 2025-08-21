import { ensureElement } from '../utils/utils';

export class Modal {
  private root: HTMLElement;
  private contentEl: HTMLElement;
  private closeBtn: HTMLButtonElement;

  constructor(container: HTMLElement) {
    this.root = container;
    this.contentEl = ensureElement('.modal__content', this.root);
    this.closeBtn = ensureElement<HTMLButtonElement>('.modal__close', this.root);

    this.onOverlayClick = this.onOverlayClick.bind(this);
    this.onCloseClick = this.onCloseClick.bind(this);

    this.root.addEventListener('mousedown', this.onOverlayClick);
    this.closeBtn.addEventListener('click', this.onCloseClick);
  }

  private onOverlayClick(e: MouseEvent) {
    if (e.target === this.root) this.close();
  }
  private onCloseClick() {
    this.close();
  }

  set content(value: HTMLElement) {
    this.contentEl.innerHTML = '';
    this.contentEl.append(value);
  }

  open(content?: HTMLElement) {
    if (content) this.content = content;
    this.root.classList.add('modal_active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.root.classList.remove('modal_active');
    document.body.style.removeProperty('overflow');
    this.contentEl.innerHTML = '';
  }
}
