import { EventEmitter } from '../../common/base/events'; 
import { BaseForm } from '../../common/base-form';
import { AppEvents, PaymentMethod } from '../../../types'; 
 
type OrderFormState = {
  payment: PaymentMethod | null;
  address: string;
  valid: boolean;
  errors: string;
  showErrors?: boolean;
};

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
      this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, { address } as any);
    });

    this.btnCard.addEventListener('click', (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_PAYMENT_SELECTED, {
        payment: 'card'
      } as any);
    });

    this.btnCash.addEventListener('click', (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_PAYMENT_SELECTED, {
        payment: 'cash'
      } as any);
    });

    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_SUBMITTED);
    });
  }

  render(state: OrderFormState) {
    const address = state.address ?? '';
    if (this.inputAddress.value !== address) {
      this.inputAddress.value = address;
    }

    // подсветка выбранного способа оплаты
    this.setPaymentLocal(state.payment ?? null);

    // показываем ошибки только по явному флагу (после сабмита)
    const shouldShowErrors = state.showErrors === true;
    this.errors = shouldShowErrors ? (state.errors ?? '') : '';

    // валидность можем выставлять всегда (или оставить как есть)
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

