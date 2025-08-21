import { Component } from '../base/component';
import { ensureElement } from '../../utils/utils';

export class SuccessView extends Component<{ total: number; onClose: () => void }> {
  private titleEl: HTMLElement;
  private descEl: HTMLElement;
  private closeBtn: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);
    this.titleEl = ensureElement('.order-success__title', container);
    this.descEl = ensureElement('.order-success__description', container);
    this.closeBtn = ensureElement<HTMLButtonElement>('.order-success__close', container);
  }

  protected update(data: { total: number; onClose: () => void }): void {
    this.setText(this.titleEl, 'Заказ оформлен');
    this.setText(this.descEl, `Списано ${data.total.toLocaleString('ru-RU')} синапсов`);
    this.closeBtn.onclick = data.onClose;
  }
}
