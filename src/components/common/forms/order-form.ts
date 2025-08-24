// src/components/common/forms/order-form.ts
import { EventEmitter } from '../../base/events';
import { AppEvents, PaymentMethod } from '../../../types';

type OrderFormState = {
  payment: PaymentMethod | null; // что выбрано в МОДЕЛИ
  address: string;               // адрес из МОДЕЛИ
  valid: boolean;                // рассчитано презентером по модели
  errors: string;                // текст ошибки (если есть)
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

    this.inputAddress = this.el.querySelector('input[name="address"]')!;
    this.btnCard = this.el.querySelector('button[name="card"]')!;
    this.btnCash = this.el.querySelector('button[name="cash"]')!;
    this.submitBtn = this.el.querySelector('.order__button')!;
    this.errorsEl = this.el.querySelector('.form__errors');

    // Ввод адреса — только уведомляем презентер (без локальной валидации/состояния)
    this.inputAddress.addEventListener('input', () => {
      const address = this.inputAddress.value ?? '';
      this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, {
        payment: null,         // представление не знает/не хранит выбор оплаты
        address,
      } as any);
    });

    // Выбор способа оплаты — только уведомляем презентер
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

    // Сабмит шага 1 — презентер проверит модель и решит, можно ли дальше
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_SUBMITTED);
    });
  }

  /** Управление disabled «Далее» приходит снаружи */
  set valid(v: boolean) {
    this.submitBtn.toggleAttribute('disabled', !v);
  }

  /** Текст ошибки приходит снаружи */
  set errors(msg: string) {
    if (this.errorsEl) this.errorsEl.textContent = msg ?? '';
  }

  /**
   * Полный контроль отображения — ТОЛЬКО из состояния (модель/презентер).
   * Здесь нет побочных эффектов и нет изменений данных.
   */
  render(state: OrderFormState) {
    // адрес
    if (this.inputAddress.value !== (state.address ?? '')) {
      this.inputAddress.value = state.address ?? '';
    }

    // подсветка выбранной оплаты
    this.btnCard.classList.toggle('button_alt-active', state.payment === 'card');
    this.btnCash.classList.toggle('button_alt-active', state.payment === 'cash');

    // ошибки и доступность кнопки
    this.errors = state.errors ?? '';
    this.valid = Boolean(state.valid);

    return this.el;
  }
}
