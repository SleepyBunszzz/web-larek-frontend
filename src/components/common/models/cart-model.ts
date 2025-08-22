import { BaseModel } from '../../base/model';
import { AppEvents, IProduct } from '../../../types';

export class CartModel extends BaseModel {
  private _items: IProduct[] = [];

  get items(): IProduct[] {
    return this._items;
  }

  addItem(product: IProduct) {
    if (!this._items.some((i) => i.id === product.id)) {
      this._items.push(product);
      this.emit(AppEvents.CART_UPDATED, this._items);
    }
  }

  removeItem(productId: string) {
    this._items = this._items.filter((i) => i.id !== productId);
    this.emit(AppEvents.CART_UPDATED, this._items);
  }

  clearCart() {
    this._items = [];
    this.emit(AppEvents.CART_UPDATED, this._items);
  }

  getTotal(): number {
    return this._items.reduce((sum, p) => sum + (p.cost ?? 0), 0);
  }
}
