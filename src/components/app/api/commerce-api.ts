import { Api, ApiListResponse } from '../../common/base/api';
import type { ApiProduct, OrderPayload, OrderResponse } from '../../../types';

export class CommerceAPI extends Api {
  async getProducts(): Promise<ApiProduct[]> {
    const raw = await this.get<ApiListResponse<ApiProduct> | ApiProduct[]>('/product')
      .catch(() => this.get<ApiListResponse<ApiProduct> | ApiProduct[]>('/products'));

    if (Array.isArray(raw)) return raw;
    return Array.isArray(raw?.items) ? raw.items : [];
  }

  getProductById(id: string): Promise<ApiProduct> {
    return this.get<ApiProduct>(`/product/${id}`);
  }

  async createOrder(order: OrderPayload): Promise<OrderResponse> {
    return await this.post<OrderResponse, OrderPayload>('/order', order);
  }
}
