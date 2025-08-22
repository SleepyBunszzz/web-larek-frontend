// src/components/common/forms/order-form.ts
import { Form } from '../form';
import type { IEvents } from '../../base/events';
import type { PaymentMethod } from '../../../types';            // <- фиксим путь
import { ensureElement } from '../../../utils/utils';           // <- фиксим путь

type OrderFields = { address: string; payment: PaymentMethod };

export class OrderForm extends Form<OrderFields> {
  private addressInput: HTMLInputElement;
  private payCardBtn: HTMLButtonElement;
  private payCashBtn: HTMLButtonElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    // <- добавляем дженерики, чтобы вернуть точные типы элементов
    this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
    this.payCardBtn   = ensureElement<HTMLButtonElement>('button[name="card"]', container);
    this.payCashBtn   = ensureElement<HTMLButtonElement>('button[name="cash"]', container);

    const emit = () =>
      this.events.emit('order.address:changed', {
        payment: (this.payCardBtn.classList.contains('button_active') ? 'card' : 'cash') as PaymentMethod,
        address: this.addressInput.value,
      });

    this.payCardBtn.addEventListener('click', () => {
      this.payCardBtn.classList.add('button_active');
      this.payCashBtn.classList.remove('button_active');
      emit();
    });

    this.payCashBtn.addEventListener('click', () => {
      this.payCashBtn.classList.add('button_active');
      this.payCardBtn.classList.remove('button_active');
      emit();
    });
  }

  reset() {
    this.addressInput.value = '';
    this.payCardBtn.classList.remove('button_active');
    this.payCashBtn.classList.remove('button_active');
  }
}
