import { Api, ApiListResponse } from '../../base/api';
import { CDN_URL } from '../../../utils/constants';
import type { IProduct, OrderPayload } from '../../../types';

// 👉 Вставляем сюда
type RawProduct = Partial<{
  id: string;
  name: string;
  title: string;
  cost: number;
  price: number;
  desc: string;
  description: string;
  img_url: string;
  image: string;
  imageUrl: string;
  category: string;
}>;

export class CommerceAPI extends Api {
  private getJSON<T>(uri: string): Promise<T> {
    return super.get(uri) as Promise<T>;
  }

  private postJSON<T>(uri: string, body: object): Promise<T> {
    return super.post(uri, body) as Promise<T>;
  }

  private toCdn(path?: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const cdn = (CDN_URL ?? '').replace(/\/+$/, '');
    return `${cdn}/${String(path).replace(/^\/+/, '')}`;
  }

private normalizeProduct(raw: RawProduct): IProduct {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? raw.title ?? ''),
    cost: Number(raw.cost ?? raw.price ?? 0),
    desc: raw.desc ?? raw.description ?? '',
    img_url: this.toCdn(raw.img_url ?? raw.image ?? raw.imageUrl),
    category: String(raw.category ?? 'other'),
  };
}
  async getProducts(): Promise<IProduct[]> {
    const raw =
      await this.getJSON<unknown>('/product').catch(() =>
        this.getJSON<unknown>('/products')
      );

    const items = Array.isArray(raw)
      ? raw
      : (raw as ApiListResponse<unknown> | undefined)?.items ?? [];

    const normalized = (items as unknown[]).map((it): IProduct => this.normalizeProduct(it));
    console.debug('[getProducts] count:', normalized.length, normalized[0]);
    return normalized;
  }

  getProductById(id: string): Promise<IProduct> {
    return this.getJSON<unknown>(`/product/${id}`)
      .then((raw): IProduct => this.normalizeProduct(raw));
  }

  createOrder(order: OrderPayload): Promise<void> {
    return this.postJSON<unknown>('/order', order).then((): void => {});
  }
}