import { Component } from '../base/component';

export abstract class Form<T extends object> extends Component<T> {
  protected submitBtn: HTMLButtonElement;
  protected errorsEl: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this.submitBtn = container.querySelector('.button[type="submit"], .order__button, .button') as HTMLButtonElement;
    this.errorsEl = container.querySelector('.form__errors') || document.createElement('span');
  }

  protected onInputChange<K extends keyof T>(field: K, value: T[K]) {
    // Переопределяется наследниками: дергают свои коллбеки
  }

  setError(msg: string) {
    if (this.errorsEl) this.setText(this.errorsEl, msg);
  }
}
