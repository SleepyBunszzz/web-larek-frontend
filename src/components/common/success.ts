import { Component } from '../base/component';
import { ensureElement } from '../../utils/utils';

interface ISuccess {
  total: number;
}

interface ISuccessActions {
  onClick: () => void;
}

export class Success extends Component<ISuccess> {
  protected _close: HTMLElement;
  protected _totalText: HTMLElement | null;

  constructor(container: HTMLElement, actions: ISuccessActions) {
    super(container);

    this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
    this._totalText = this.container.querySelector('.order-success__description');

    if (actions?.onClick) {
      this._close.addEventListener('click', actions.onClick);
    }
  }

  render(data: ISuccess): HTMLElement {
    super.render(data);
    if (this._totalText) {
      this._totalText.textContent = `Списано ${data.total.toLocaleString('ru-RU')} синапсов`;
    }
    return this.container;
  }
}
