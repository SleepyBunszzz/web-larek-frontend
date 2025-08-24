import { BaseModel } from '../../common/base/model';
import { AppEvents, IProduct } from '../../../types';
import { CDN_URL } from '../../../utils/constants';


function toCdn(path?: string): string {
  if (!path) return '';
  const s = String(path);
  if (/^(https?:)?\/\//i.test(s)) return s;     
  if (/^data:/i.test(s)) return s;               
  const cdn = (CDN_URL ?? '').trim();
  if (!cdn) return s;                            
  return `${cdn.replace(/\/+$/, '')}/${s.replace(/^\/+/, '')}`;
}


function mapToProduct(raw: any): IProduct {
  return {
    id: String(raw?.id ?? ''),
    name: String(raw?.name ?? raw?.title ?? ''),
    cost: Number(raw?.cost ?? raw?.price ?? 0),
    desc: raw?.desc ?? raw?.description ?? '',
    img_url: toCdn(raw?.img_url ?? raw?.image ?? raw?.imageUrl ?? ''),
    category: String(raw?.category ?? 'other'),
  };
}

export class ProductModel extends BaseModel {
  private _products: IProduct[] = [];
  private _preview: IProduct | null = null;

  setProducts(productsRaw: unknown[]) {
    const normalized = (productsRaw ?? []).map((it) => mapToProduct(it));
    this._products = normalized;
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
