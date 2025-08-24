import { Component } from '../../common/base/component';
import { ensureElement, formatNumber } from '../../../utils/utils';

type SuccessData = { total: number; onClose: () => void };

export class SuccessView extends Component<SuccessData> {
  private totalEl: HTMLElement;
  private closeBtn: HTMLButtonElement;

  private onCloseCallback: (() => void) | null = null;

  constructor(container: HTMLElement) {
    super(container);
    this.totalEl = ensureElement<HTMLElement>('.order-success__description', container);
    this.closeBtn = ensureElement<HTMLButtonElement>('.order-success__close', container);

    this.closeBtn.addEventListener('click', () => {
      this.onCloseCallback?.();
    });
  }

  render(data: SuccessData): HTMLElement {
    super.render(data);

    this.totalEl.textContent = `Списано ${formatNumber(data.total)}`;

    this.onCloseCallback = data.onClose;

    return this.el;
  }
}
 