import { BaseModel } from '../../base/model';
import { AppEvents, IProduct } from '../../../types';

export class ProductModel extends BaseModel {
  private _products: IProduct[] = [];
  private _preview: IProduct | null = null;

  setProducts(products: IProduct[]) {
    this._products = products.slice();
    this.emit(AppEvents.PRODUCTS_LOADED, this._products);
  }

  get products(): IProduct[] {
    return this._products;
  }

  getProduct(id: string): IProduct | undefined {
    return this._products.find((p) => p.id === id);
  }

  setPreview(product: IProduct | null) {
    this._preview = product;
    this.emit(AppEvents.PRODUCT_PREVIEW, product ?? null);
  }

  get preview(): IProduct | null {
    return this._preview;
  }
}
