import { EventEmitter } from '../../common/base/events'; 
import { BaseForm } from '../../common/base-form';
import { AppEvents, PaymentMethod } from '../../../types'; 
import type { OrderFormState as OrderFormStateBase } from '../../../types';

// Локальный тип представления: доменное состояние + UI-флаг
type OrderFormViewState = OrderFormStateBase & { showErrors?: boolean };

export class OrderForm extends BaseForm {
  private inputAddress: HTMLInputElement;
  private btnCard: HTMLButtonElement;
  private btnCash: HTMLButtonElement;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    super(container, events);

    this.inputAddress = this.el.querySelector('input[name="address"]') as HTMLInputElement;
    this.btnCard = this.el.querySelector('button[name="card"]') as HTMLButtonElement;
    this.btnCash = this.el.querySelector('button[name="cash"]') as HTMLButtonElement;

    this.inputAddress.addEventListener('input', () => {
      const address = this.inputAddress.value ?? '';
      // строгая типизация по EventPayloads
      this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, { address });
    });

    this.btnCard.addEventListener('click', (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_PAYMENT_SELECTED, {
        payment: 'card',
      });
    });

    this.btnCash.addEventListener('click', (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_PAYMENT_SELECTED, {
        payment: 'cash',
      });
    });

    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_SUBMITTED);
    });
  }

  render(state: OrderFormViewState) {
    const address = state.address ?? '';
    if (this.inputAddress.value !== address) {
      this.inputAddress.value = address;
    }

    this.setPaymentLocal(state.payment ?? null);

    const shouldShowErrors = state.showErrors === true;
    this.errors = shouldShowErrors ? (state.errors ?? '') : '';

    this.valid = Boolean(state.valid);

    return this.el;
  }

  private setPaymentLocal(method: PaymentMethod | null) {
    this.btnCard.classList.toggle('button_alt-active', method === 'card');
    this.btnCash.classList.toggle('button_alt-active', method === 'cash');

    this.btnCard.setAttribute('aria-pressed', String(method === 'card'));
    this.btnCash.setAttribute('aria-pressed', String(method === 'cash'));
  }
}
