// src/components/common/forms/success-view.ts
import { Component } from '../../common/base/component';
import { formatNumber } from '../../../utils/utils';

type SuccessData = { total: number; onClose: () => void };

export class SuccessView extends Component {
  private totalEl: HTMLElement;
  private closeBtn: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);

    const total = container.querySelector('.order-success__description') as HTMLElement | null;
    const close = container.querySelector('.order-success__close') as HTMLButtonElement | null;

    if (!total) throw new Error('SuccessView: .order-success__description not found');
    if (!close) throw new Error('SuccessView: .order-success__close not found');

    this.totalEl = total;
    this.closeBtn = close;
  }

  // Используем функционал родителя: super.render(data) вызывает update(data)
  render(data: SuccessData): HTMLElement {
    return super.render(data);
  }

  // Единственное место, где мы изменяем DOM на основе данных
  protected update(data?: unknown): void {
    const { total, onClose } = (data ?? {}) as SuccessData;

    // "Списано N синапсов"
    this.totalEl.textContent = `Списано ${formatNumber(total)} синапсов`;

    // Актуализируем обработчик закрытия
    // (переназначаем onClick на каждый рендер, без утечек и дублей)
    this.closeBtn.onclick = () => onClose?.();
  }
}
