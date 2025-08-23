import { Api, ApiListResponse } from '../../base/api';
import { CDN_URL } from '../../../utils/constants';
import type { IProduct, OrderPayload } from '../../../types';

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

  private normalizeProduct(raw: unknown): IProduct {
    const r = raw as Record<string, unknown>;
    return {
      id: String(r.id ?? ''),
      name: String((r as any).name ?? (r as any).title ?? ''),
      cost: Number((r as any).cost ?? (r as any).price ?? 0),
      desc: (r as any).desc ?? (r as any).description ?? '',
      img_url: this.toCdn((r as any).img_url ?? (r as any).image ?? (r as any).imageUrl),
      category: String((r as any).category ?? 'other'),
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