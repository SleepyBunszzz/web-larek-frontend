// src/components/common/forms/order-form.ts
import { EventEmitter } from '../../common/base/events';
import { AppEvents, PaymentMethod } from '../../../types';

type OrderFormState = {
  payment: PaymentMethod | null;
  address: string;
  valid: boolean;
  errors: string;
};

export class OrderForm {
  private el: HTMLFormElement;
  private events: EventEmitter;

  private inputAddress: HTMLInputElement;
  private btnCard: HTMLButtonElement;
  private btnCash: HTMLButtonElement;
  private submitBtn: HTMLButtonElement;
  private errorsEl: HTMLElement | null;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    this.el = container;
    this.events = events;

    // ищем элементы без сторонних утилит
    const address = this.el.querySelector('input[name="address"]') as HTMLInputElement | null;
    const btnCard = this.el.querySelector('button[name="card"]') as HTMLButtonElement | null;
    const btnCash = this.el.querySelector('button[name="cash"]') as HTMLButtonElement | null;
    const submit =
      (this.el.querySelector('button[type="submit"]') as HTMLButtonElement | null) ??
      (this.el.querySelector('.order__button') as HTMLButtonElement | null);

    if (!address) throw new Error('OrderForm: input[name="address"] not found');
    if (!btnCard) throw new Error('OrderForm: button[name="card"] not found');
    if (!btnCash) throw new Error('OrderForm: button[name="cash"] not found');
    if (!submit)  throw new Error('OrderForm: submit button not found');

    this.inputAddress = address;
    this.btnCard = btnCard;
    this.btnCash = btnCash;
    this.submitBtn = submit;
    this.errorsEl = this.el.querySelector('.form__errors');

    // View -> Presenter/Model: только уведомляем об изменениях,
    // НИКАКОЙ локальной валидации/перерисовки.
    this.inputAddress.addEventListener('input', () => {
      this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, {
        payment: null, // «не менять способ оплаты»
        address: this.inputAddress.value ?? '',
      } as any);
    });

    this.btnCard.addEventListener('click', (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, {
        payment: 'card',
        address: this.inputAddress.value ?? '',
      } as any);
    });

    this.btnCash.addEventListener('click', (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, {
        payment: 'cash',
        address: this.inputAddress.value ?? '',
      } as any);
    });

    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_SUBMITTED);
    });
  }

  // Доступность сабмита управляется только внешним состоянием
  set valid(v: boolean) {
    this.submitBtn.toggleAttribute('disabled', !v);
  }

  // Ошибки приходят только извне
  set errors(msg: string) {
    if (this.errorsEl) this.errorsEl.textContent = msg ?? '';
  }

  /**
   * Метод оставлен для совместимости.
   * Не «перекрашивает» локально — лишь сообщает презентеру,
   * чтобы тот обновил модель и затем передал новое состояние в render().
   */
  setInitialPayment(method: PaymentMethod) {
    this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, {
      payment: method,
      address: this.inputAddress?.value ?? '',
    } as any);
  }

  /**
   * Единственное место, где меняется UI — применяем внешнее состояние.
   */
  render(state: OrderFormState) {
    // адрес
    const address = state.address ?? '';
    if (this.inputAddress.value !== address) {
      this.inputAddress.value = address;
    }

    // визуализация выбранного способа оплаты — строго из state
    const method = state.payment; // null | 'card' | 'cash'
    this.btnCard.classList.toggle('button_alt-active', method === 'card');
    this.btnCash.classList.toggle('button_alt-active', method === 'cash');
    this.btnCard.setAttribute('aria-pressed', String(method === 'card'));
    this.btnCash.setAttribute('aria-pressed', String(method === 'cash'));

    // ошибки и доступность сабмита — только извне
    this.errors = state.errors ?? '';
    this.valid = Boolean(state.valid);

    return this.el;
  }
}
