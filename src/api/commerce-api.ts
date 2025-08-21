// src/api/commerce-api.ts
import { Api, ApiPostMethods } from '../components/base/api';
import { CDN_URL } from '../utils/constants';
import { ICommerceAPI, IProduct, OrderPayload } from '../types';

/**
 * Клиент Web-ларька: подмешивает CDN к изображениям
 */
export class CommerceAPI extends Api implements ICommerceAPI {
  // === Перегрузки для get (чтобы удовлетворить IApiClient) ===
  get<T>(uri: string): Promise<T>;
  // Реализация get должна идти СРАЗУ после перегрузок get
  get(uri: string): Promise<any> {
    return super.get(uri);
  }

  // === Перегрузки для post (чтобы удовлетворить IApiClient) ===
  post<T>(uri: string, data: unknown, method?: ApiPostMethods): Promise<T>;
  // Реализация post должна идти СРАЗУ после перегрузок post
  post(uri: string, data: unknown, method: ApiPostMethods = 'POST'): Promise<any> {
    return super.post(uri, data as object, method);
  }

  // === Методы ICommerceAPI ===
  async getProducts(): Promise<IProduct[]> {
    const data = await this.get<{ items: IProduct[] }>('/products');
    return data.items.map((p) => ({
      ...p,
      img_url: p.img_url.startsWith('http') ? p.img_url : `${CDN_URL}/${p.img_url}`,
    }));
  }

  async getProductById(id: string): Promise<IProduct> {
    const p = await this.get<IProduct>(`/products/${id}`);
    return {
      ...p,
      img_url: p.img_url.startsWith('http') ? p.img_url : `${CDN_URL}/${p.img_url}`,
    };
  }

  async createOrder(order: OrderPayload): Promise<void> {
    await this.post<void>('/orders', order);
  }
}


