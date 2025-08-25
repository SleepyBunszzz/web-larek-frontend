import { BaseModel } from '../../common/base/model';
import type { PaymentMethod } from '../../../types';

export class OrderModel extends BaseModel {
  payment: PaymentMethod | null = null;
  address = '';
  email   = '';
  phone   = '';

  setPayment(method: PaymentMethod) { this.payment = method; this.emit('order:changed'); }
  setAddress(address: string)       { this.address = address; this.emit('order:changed'); }
  setEmail(email: string)           { this.email = email;     this.emit('order:changed'); }
  setPhone(phone: string)           { this.phone = phone;     this.emit('order:changed'); }

  validate(): boolean {
    const hasAddress = (this.address ?? '').trim().length > 0;
    const hasPayment = !!this.payment;
    const hasEmail   = (this.email ?? '').trim().length > 0;
    const hasPhone   = (this.phone ?? '').trim().length > 0;
    return hasAddress && hasPayment && hasEmail && hasPhone;
  }
}
