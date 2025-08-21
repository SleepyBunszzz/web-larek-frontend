import { IOrderModel, PaymentMethod } from '../types';

export class OrderModel implements IOrderModel {
  payment: PaymentMethod = 'card';
  address = '';
  name = '';
  email = '';
  phone = '';

  setPayment(method: PaymentMethod): void {
    this.payment = method;
  }
  setAddress(address: string): void {
    this.address = address.trim();
  }
  setName(name: string): void {
    this.name = name.trim();
  }
  setEmail(email: string): void {
    this.email = email.trim();
  }
  setPhone(phone: string): void {
    this.phone = phone.trim();
  }

  validate(): boolean {
    const hasAddress = this.address.length > 3;
    const hasName = this.name.length > 1;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    const phoneOk = this.phone.replace(/[^\d]/g, '').length >= 10;
    return !!this.payment && hasAddress && hasName && emailOk && phoneOk;
  }
}
