// src/components/common/forms/contacts-form.ts
import { EventEmitter } from '../../base/events';
import { ensureElement } from '../../../utils/utils';

export class ContactsForm {
  private el: HTMLFormElement;
  private events: EventEmitter;

  private inputEmail: HTMLInputElement;
  private inputPhone: HTMLInputElement;
  private inputName: HTMLInputElement | null;

  private submitBtn: HTMLButtonElement;
  private errorsEl: HTMLElement | null;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    this.el = container;
    this.events = events;

    // обязательные элементы
    this.inputEmail = ensureElement<HTMLInputElement>('input[name="email"]', this.el);
    this.inputPhone = ensureElement<HTMLInputElement>('input[name="phone"]', this.el);
    this.submitBtn  = ensureElement<HTMLButtonElement>('button[type="submit"]', this.el);

    // опциональные
    this.inputName  = this.el.querySelector<HTMLInputElement>('input[name="name"]');
    this.errorsEl   = this.el.querySelector<HTMLElement>('.form__errors');

    // Слушатели ввода: эмитим наружу + локально включаем/выключаем кнопку по простому правилу
    this.inputEmail.addEventListener('input', () => {
      this.events.emit('contacts.email:change', { field: 'email', value: this.inputEmail.value });
      this.errors = '';
      this.validateAndToggle();
    });

    this.inputPhone.addEventListener('input', () => {
      this.events.emit('contacts.phone:change', { field: 'phone', value: this.inputPhone.value });
      this.errors = '';
      this.validateAndToggle();
    });

    this.inputName?.addEventListener('input', () => {
      this.events.emit('contacts.name:change', { field: 'name', value: this.inputName!.value });
      // имя опционально — на валидность не влияет
    });

    // Сабмит: финальную проверку делает OrderModel.validate() в презентере
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      this.validateAndToggle(); // на всякий случай пересчёт
      this.events.emit('contacts:submit');
    });
  }

  set valid(v: boolean) {
    this.submitBtn.toggleAttribute('disabled', !v);
  }

  set errors(msg: string) {
    if (this.errorsEl) this.errorsEl.textContent = msg ?? '';
  }

  render(opts: { valid: boolean; errors: string }) {
    this.valid = opts.valid;
    this.errors = opts.errors;
    return this.el;
  }

  /**
   * Локальная UX-проверка: активируем «Оплатить», если валиден e-mail ИЛИ телефон.
   * Финальная бизнес-валидация — в OrderModel.validate() (не меняем существующий функционал).
   */
  private validateAndToggle() {
    const email = (this.inputEmail.value ?? '').trim();
    const phone = (this.inputPhone.value ?? '').trim();

    const emailOk = /\S+@\S+\.\S+/.test(email);
    const phoneOk = /^\+?\d[\d\s()-]{5,}$/.test(phone);

    this.valid = emailOk || phoneOk;
  }
}
