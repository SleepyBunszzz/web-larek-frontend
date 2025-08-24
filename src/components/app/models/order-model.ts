import { BaseModel } from '../../common/base/model';
import type { PaymentMethod } from '../../../types';

export class OrderModel extends BaseModel {
  payment: PaymentMethod | null = null;
  address = '';
  email = '';
  phone = '';

  setPayment(method: PaymentMethod) {
    this.payment = method;
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

  validate(): boolean {
    const addrOk = this.address.trim().length > 3;
    const payOk = !!this.payment;
    const contactOk =
      /\S+@\S+\.\S+/.test(this.email) || /^\+?\d{6,}$/.test(this.phone);
    return addrOk && payOk && contactOk;
  }
}
