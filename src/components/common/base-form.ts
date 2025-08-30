import { EventEmitter } from '../common/base/events';
import { ensureElement } from '../../utils/utils';

export abstract class BaseForm {
  protected el: HTMLFormElement;
  protected events: EventEmitter;

  protected submitBtn: HTMLButtonElement;
  protected errorsEl: HTMLElement | null;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    this.el = container;
    this.events = events;

    this.submitBtn = ensureElement<HTMLButtonElement>('button[type="submit"]', this.el);
    this.errorsEl = this.el.querySelector('.form__errors');
  }

  set valid(v: boolean) {
    this.submitBtn.toggleAttribute('disabled', !v);
  }

  set errors(msg: string) {
    if (this.errorsEl) this.errorsEl.textContent = msg ?? '';
  }
}