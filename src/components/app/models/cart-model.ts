// src/components/app/models/cart-model.ts
import { BaseModel } from '../../common/base/model';
import type { IProduct } from '../../../types';

export class CartModel extends BaseModel {
  items: IProduct[] = [];

  addItem(p: IProduct) {
    if (!this.items.find(i => i.id === p.id)) {
      this.items.push(p);
      this.emit('cart:changed');
    }
  }

  removeItem(id: string) {
    const before = this.items.length;
    this.items = this.items.filter(i => i.id !== id);
    if (this.items.length !== before) {
      this.emit('cart:changed');
    }
  }

  clearCart() {
    if (this.items.length) {
      this.items = [];
      this.emit('cart:changed');
    }
  }

  getTotal(): number {
    return this.items.reduce((sum, p) => sum + (p.cost ?? 0), 0);
  }
}