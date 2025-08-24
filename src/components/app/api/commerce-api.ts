import { Api, ApiListResponse } from '../../common/base/api';
import type { OrderPayload } from '../../../types';

export class CommerceAPI extends Api {
  async getProducts(): Promise<unknown[]> {
    const raw =
      await this.get('/product').catch(() =>
        this.get('/products')
      );

    if (Array.isArray(raw)) return raw as unknown[];
    const items = (raw as ApiListResponse<unknown> | undefined)?.items;
    return Array.isArray(items) ? (items as unknown[]) : [];
  }

  getProductById(id: string): Promise<unknown> {
    return this.get(`/product/${id}`) as Promise<unknown>;
  }

  createOrder(order: OrderPayload): Promise<void> {
    return this.post('/order', order).then(() => {});
  }
}
