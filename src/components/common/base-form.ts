import { EventEmitter } from '../common/base/events';

export abstract class BaseForm {
  protected el: HTMLFormElement;
  protected events: EventEmitter;

  protected submitBtn: HTMLButtonElement;
  protected errorsEl: HTMLElement | null;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    this.el = container;
    this.events = events;

    this.submitBtn = this.el.querySelector('.order__button, .form__submit') as HTMLButtonElement;
    this.errorsEl = this.el.querySelector('.form__errors');
  }

  /** включаем/выключаем сабмит-кнопку — решение принимает модель/презентер, а не форма */
  set valid(v: boolean) {
    if (this.submitBtn) this.submitBtn.toggleAttribute('disabled', !v);
  }

  /** выводим текст ошибок — строка готовая от модели/презентера */
  set errors(msg: string) {
    if (this.errorsEl) this.errorsEl.textContent = msg ?? '';
  }
}