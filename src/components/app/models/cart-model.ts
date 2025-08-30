import { BaseModel } from '../../common/base/model';
import type { IProduct } from '../../../types';
import { AppEvents } from '../../../types';

export class CartModel extends BaseModel {
  items: IProduct[] = [];

  addItem(product: IProduct): void {
    if (!this.items.some((i) => i.id === product.id)) {
      this.items.push(product);
      this.emit(AppEvents.CART_CHANGED);
    }
  }

  removeItem(productId: string): void {
    const lenBefore = this.items.length;
    this.items = this.items.filter((i) => i.id !== productId);
    if (this.items.length !== lenBefore) {
      this.emit(AppEvents.CART_CHANGED);
    }
  }

  clearCart(): void {
    if (this.items.length > 0) {
      this.items = [];
      this.emit(AppEvents.CART_CHANGED);
    }
  }

  getTotal(): number {
    return this.items.reduce((acc, i) => acc + (i.cost ?? 0), 0);
  }
}
