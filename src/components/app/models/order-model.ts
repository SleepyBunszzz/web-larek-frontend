import { BaseModel } from '../../common/base/model';
import type { PaymentMethod, IOrderModel, OrderFormState, ContactsFormState } from '../../../types';

type ValidationResult = { valid: boolean; errors: string };

export class OrderModel extends BaseModel implements IOrderModel {
  payment: PaymentMethod | null = null;
  address = '';
  email = '';
  phone = '';

  setPayment(method: PaymentMethod | null): void {
    this.payment = method;
    this.emit('order:changed');
  }

  setAddress(address: string): void {
    this.address = address;
    this.emit('order:changed');
  }

  setEmail(email: string): void {
    this.email = email;
    this.emit('order:changed');
  }

  setPhone(phone: string): void {
    this.phone = phone;
    this.emit('order:changed');
  }

  validateStep1(): ValidationResult {
    const hasAddress = (this.address ?? '').trim().length > 0;
    if (!hasAddress) {
      return { valid: false, errors: 'Необходимо указать адрес' };
    }

    const hasPayment = !!this.payment;
    if (!hasPayment) {
      return { valid: false, errors: 'Выберите способ оплаты' };
    }

    return { valid: true, errors: '' };
  }

  validateContacts(): ValidationResult {
    const emailNotEmpty = (this.email ?? '').trim().length > 0;
    const phoneNotEmpty = (this.phone ?? '').trim().length > 0;

    if (!emailNotEmpty) {
      return { valid: false, errors: 'Укажите e-mail' };
    }
    if (!phoneNotEmpty) {
      return { valid: false, errors: 'Укажите телефон' };
    }

    return { valid: true, errors: '' };
  }

  validateAll(): ValidationResult {
    const s1 = this.validateStep1();
    if (!s1.valid) return s1;

    const s2 = this.validateContacts();
    if (!s2.valid) return s2;

    return { valid: true, errors: '' };
  }

  toOrderFormState(): OrderFormState {
    const { valid, errors } = this.validateStep1();
    return {
      payment: this.payment,
      address: this.address,
      valid,
      errors,
    };
  }

  toContactsFormState(): ContactsFormState {
    const { valid, errors } = this.validateContacts();
    return {
      email: this.email,
      phone: this.phone,
      valid,
      errors,
    };
  }

  reset(): void {
    this.payment = null;
    this.address = '';
    this.email = '';
    this.phone = '';
    this.emit('order:changed');
  }
}
