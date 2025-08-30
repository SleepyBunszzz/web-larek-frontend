import { BaseModel } from '../../common/base/model';
import type { PaymentMethod, IOrderModel, OrderFormState, ContactsFormState } from '../../../types';

type ValidationResult = { valid: boolean; errors: string };

export class OrderModel extends BaseModel implements IOrderModel {
  payment: PaymentMethod | null = null;
  address = '';
  email = '';
  phone = '';

  // Показывать ошибки шагов
  private _step1ShowErrors = false;
  private _step2ShowErrors = false;

  // Какое поле контактов пользователь трогал последним (для приоритета текста ошибки)
  private _lastContactsBlur: 'email' | 'phone' | null = null;

  // --- getters/setters UI-флагов
  setStep1ShowErrors(v: boolean): void {
    this._step1ShowErrors = v;
    this.emit('order:changed');
  }
  setStep2ShowErrors(v: boolean): void {
    this._step2ShowErrors = v;
    this.emit('order:changed');
  }
  get step1ShowErrors(): boolean { return this._step1ShowErrors; }
  get step2ShowErrors(): boolean { return this._step2ShowErrors; }

  setLastContactsBlur(field: 'email' | 'phone'): void {
    this._lastContactsBlur = field;
    this.emit('order:changed');
  }

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

  /**
   * Валидация шага 2 с приоритетом поля `prefer`.
   * Если prefer='phone' и телефон пуст — вернём "Необходимо указать телефон".
   * Если prefer не задан — проверяем email затем телефон.
   */
  validateContacts(prefer?: 'email' | 'phone'): ValidationResult {
    const emailNotEmpty = (this.email ?? '').trim().length > 0;
    const phoneNotEmpty = (this.phone ?? '').trim().length > 0;

    const checkOrder: Array<'email' | 'phone'> =
      prefer === 'email' ? ['email', 'phone']
      : prefer === 'phone' ? ['phone', 'email']
      : ['email', 'phone'];

    for (const f of checkOrder) {
      if (f === 'email' && !emailNotEmpty) {
        return { valid: false, errors: 'Необходимо указать e-mail' };
      }
      if (f === 'phone' && !phoneNotEmpty) {
        return { valid: false, errors: 'Необходимо указать телефон' };
      }
    }

    return { valid: true, errors: '' };
  }

  validateAll(): ValidationResult {
    const s1 = this.validateStep1();
    if (!s1.valid) return s1;

    const s2 = this.validateContacts(this._lastContactsBlur ?? undefined);
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
    const { valid, errors } = this.validateContacts(this._lastContactsBlur ?? undefined);
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
    this._step1ShowErrors = false;
    this._step2ShowErrors = false;
    this._lastContactsBlur = null;
    this.emit('order:changed');
  }
}
