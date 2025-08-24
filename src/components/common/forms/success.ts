// src/components/common/forms/success.ts
import { Component } from '../../base/component';
import { ensureElement, formatNumber } from '../../../utils/utils';

type SuccessData = { total: number; onClose: () => void };

export class SuccessView extends Component<SuccessData> {
  private totalEl: HTMLElement;
  private closeBtn: HTMLButtonElement;

  // Текущий колбэк закрытия, задаётся при render()
  private onCloseCallback: (() => void) | null = null;

  constructor(container: HTMLElement) {
    super(container);
    this.totalEl = ensureElement<HTMLElement>('.order-success__description', container);
    this.closeBtn = ensureElement<HTMLButtonElement>('.order-success__close', container);

    // Слушатель ставим один раз — без { once }, без накопления
    this.closeBtn.addEventListener('click', () => {
      this.onCloseCallback?.();
    });
  }

  render(data: SuccessData): HTMLElement {
    super.render(data);

    // Обновляем текст суммы
    this.totalEl.textContent = `Списано ${formatNumber(data.total)}`;

    // Запоминаем актуальный колбэк (без перевешивания слушателя)
    this.onCloseCallback = data.onClose;

    return this.el;
  }
}
