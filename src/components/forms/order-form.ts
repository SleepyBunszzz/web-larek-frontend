// src/components/forms/order-form.ts
import { Form } from './form';
import { ensureElement } from '../../utils/utils';
import { PaymentMethod } from '../../types';

type OrderFormData = { payment: PaymentMethod; address: string };

type Handlers = {
  onChange: (data: OrderFormData) => void;
  onSubmit: () => void;
};

export class OrderForm extends Form<OrderFormData> {
  private btnCard: HTMLButtonElement;
  private btnCash: HTMLButtonElement;
  private addressInput: HTMLInputElement;

  private state: OrderFormData = { payment: 'card', address: '' };

  constructor(container: HTMLElement, private handlers: Handlers) {
    super(container);

    this.btnCard = ensureElement<HTMLButtonElement>('button[name="card"]', container);
    this.btnCash = ensureElement<HTMLButtonElement>('button[name="cash"]', container);
    this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);

    this.btnCard.addEventListener('click', () => this.setPayment('card'));
    this.btnCash.addEventListener('click', () => this.setPayment('cash'));
    this.addressInput.addEventListener('input', () => this.setAddress(this.addressInput.value));

    container.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlers.onSubmit();
    });

    this.updateButtons();
    this.updateSubmitState();
  }

  reset() {
    this.state = { payment: 'card', address: '' };
    this.addressInput.value = '';
    this.updateButtons();
    this.updateSubmitState();
    this.setError('');
  }

  private setPayment(method: PaymentMethod) {
    this.state.payment = method;
    this.updateButtons();
    this.onInputChange('payment', method); // <-- теперь сигнатура совпадает
    this.handlers.onChange(this.state);
    this.updateSubmitState();
  }

  private setAddress(address: string) {
    this.state.address = address;
    this.onInputChange('address', address); // <-- тоже ок
    this.handlers.onChange(this.state);
    this.updateSubmitState();
  }

  private updateButtons() {
    this.btnCard.classList.toggle('button_alt-active', this.state.payment === 'card');
    this.btnCash.classList.toggle('button_alt-active', this.state.payment === 'cash');
  }

  private updateSubmitState() {
    const ok = this.state.address.trim().length > 3 && !!this.state.payment;
    this.setDisabled(this.submitBtn, !ok);
  }

  // ВАЖНО: сигнатура должна совпадать с базовым Form
  protected onInputChange(field: keyof OrderFormData, value: string) {
    super.onInputChange(field, value);
  }
}
