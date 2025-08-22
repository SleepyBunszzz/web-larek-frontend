import { Component } from '../../base/component';
import { ensureElement, formatNumber } from '../../../utils/utils';

type SuccessData = { total: number; onClose: () => void };

export class SuccessView extends Component<SuccessData> {
  private totalEl: HTMLElement;
  private closeBtn: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);
    this.totalEl = ensureElement<HTMLElement>('.order-success__description', container);
    this.closeBtn = ensureElement<HTMLButtonElement>('.order-success__close', container);
  }

  render(data: SuccessData): HTMLElement {
    super.render(data);
    this.totalEl.textContent = `Списано ${formatNumber(data.total)}`;
    this.closeBtn.addEventListener('click', data.onClose, { once: true });
    return this.el;
  }
}

