import { EventEmitter } from '../../base/events';
import { AppEvents, PaymentMethod } from '../../../types';

export class OrderForm {
  private el: HTMLFormElement;
  private events: EventEmitter;

  private inputAddress: HTMLInputElement;
  private btnCard: HTMLButtonElement;
  private btnCash: HTMLButtonElement;
  private submitBtn: HTMLButtonElement;
  private errorsEl: HTMLElement | null;

  private currentPayment: PaymentMethod | null = null;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    this.el = container;
    this.events = events;

    this.inputAddress = this.el.querySelector('input[name="address"]')!;
    this.btnCard = this.el.querySelector('button[name="card"]')!;
    this.btnCash = this.el.querySelector('button[name="cash"]')!;
    this.submitBtn = this.el.querySelector('.order__button')!;
    this.errorsEl = this.el.querySelector('.form__errors');

    this.inputAddress.addEventListener('input', () => {
      this.emitAddressChanged();
      this.validateAndToggle();
    });

    this.btnCard.addEventListener('click', (e) => {
      e.preventDefault();
      this.setPayment('card');
      this.emitAddressChanged();
      this.validateAndToggle();
    });

    this.btnCash.addEventListener('click', (e) => {
      e.preventDefault();
      this.setPayment('cash');
      this.emitAddressChanged();
      this.validateAndToggle();
    });

    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      this.validateAndToggle();
      this.events.emit(AppEvents.ORDER_SUBMITTED);
    });
  }

  public setInitialPayment(method: PaymentMethod) {
    this.setPayment(method);
    this.emitAddressChanged();
    this.validateAndToggle();
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


  private setPayment(method: PaymentMethod) {
    this.currentPayment = method;
    this.btnCard.classList.toggle('button_alt-active', method === 'card');
    this.btnCash.classList.toggle('button_alt-active', method === 'cash');
  }

  private emitAddressChanged() {
    const address = this.inputAddress.value ?? '';
    this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, {
      payment: this.currentPayment,
      address,
    });
  }

  private validateAndToggle() {
    const addressOk = (this.inputAddress.value ?? '').trim().length > 3;
    const paymentOk = Boolean(this.currentPayment);

    this.errors = addressOk ? '' : 'Необходимо указать адрес';
    this.valid = addressOk && paymentOk;
  }
}
