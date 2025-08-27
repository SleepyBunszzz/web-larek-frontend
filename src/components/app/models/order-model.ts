import { BaseModel } from '../../common/base/model';
import type { PaymentMethod } from '../../../types';

type ValidationResult = { valid: boolean; errors: string };

export class OrderModel extends BaseModel {
  payment: PaymentMethod | null = null;
  name = '';
  address = '';
  email = '';
  phone = '';

  setPayment(method: PaymentMethod | null) {
    this.payment = method;
    this.emit('order:changed');
  }

  setName(name: string) {
    this.name = name;
    this.emit('order:changed');
  }

  setAddress(address: string) {
    this.address = address;
    this.emit('order:changed');
  }

  setEmail(email: string) {
    this.email = email;
    this.emit('order:changed');
  }

  setPhone(phone: string) {
    this.phone = phone;
    this.emit('order:changed');
  }

  // Шаг 1: адрес + способ оплаты
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

  // Шаг 2: контакты — теперь проверяем только, что поля не пустые
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

  // Полная валидация (оба шага)
  validateAll(): ValidationResult {
    const s1 = this.validateStep1();
    if (!s1.valid) return s1;

    const s2 = this.validateContacts();
    if (!s2.valid) return s2;

    return { valid: true, errors: '' };
  }

  // Состояния для рендера форм
  toOrderFormState() {
    const { valid, errors } = this.validateStep1();
    return {
      payment: this.payment,
      address: this.address,
      valid,
      errors,
    };
  }

  toContactsFormState() {
    const { valid, errors } = this.validateContacts();
    return {
      name: this.name,
      email: this.email,
      phone: this.phone,
      valid,
      errors,
    };
  }

  // Сброс после успешного заказа
  reset() {
    this.payment = null;
    this.name = '';
    this.address = '';
    this.email = '';
    this.phone = '';
    this.emit('order:changed');
  }
}