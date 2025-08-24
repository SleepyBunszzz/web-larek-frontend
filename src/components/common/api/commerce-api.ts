// src/components/common/api/commerce-api.ts
import { Api, ApiListResponse } from '../../base/api';
import type { OrderPayload } from '../../../types';

export class CommerceAPI extends Api {
  /**
   * Возвращает список "сырых" товаров без изменения структуры.
   * Поддерживаются два ответа сервера:
   *   - массив элементов;
   *   - объект { items: [...] }.
   */
  async getProducts(): Promise<unknown[]> {
    const raw =
      await this.get('/product').catch(() =>
        this.get('/products')
      );

    if (Array.isArray(raw)) return raw as unknown[];
    const items = (raw as ApiListResponse<unknown> | undefined)?.items;
    return Array.isArray(items) ? (items as unknown[]) : [];
  }

  /**
   * Возвращает один "сырой" товар без модификации структуры.
   * (если где-то понадобится детальная карточка по id)
   */
  getProductById(id: string): Promise<unknown> {
    return this.get(`/product/${id}`) as Promise<unknown>;
  }

  /**
   * Создание заказа. Payload не трансформируем.
   */
  createOrder(order: OrderPayload): Promise<void> {
    return this.post('/order', order).then(() => {});
  }
}
