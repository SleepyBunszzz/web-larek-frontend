import { ICartModel, IProduct } from '../types';

export class CartModel implements ICartModel {
  items: IProduct[] = [];

  addItem(product: IProduct): void {
    if (!this.items.some((i) => i.id === product.id)) {
      this.items.push(product);
    }
  }

  removeItem(productId: string): void {
    this.items = this.items.filter((i) => i.id !== productId);
  }

  clearCart(): void {
    this.items = [];
  }

  getTotal(): number {
    return this.items.reduce((s, i) => s + (i.cost || 0), 0);
  }
}
