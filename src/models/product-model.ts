import { IProduct, IProductModel } from '../types';

export class ProductModel implements IProductModel {
  products: IProduct[] = [];
  preview: IProduct | null = null;

  setProducts(products: IProduct[]): void {
    this.products = products;
  }

  getProduct(id: string): IProduct | undefined {
    return this.products.find((p) => p.id === id);
  }

  setPreview(product: IProduct | null): void {
    this.preview = product;
  }
}
