/* ========== Базовые типы ========== */
export interface IApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: unknown, method?: string): Promise<T>;
}

export interface IEventEmitter {
  on<T extends keyof EventPayloads>(
    event: T,
    callback: (payload: EventPayloads[T]) => void
  ): void;
  emit<T extends keyof EventPayloads>(event: T, payload: EventPayloads[T]): void;
  off<T extends keyof EventPayloads>(
    event: T,
    callback: (payload: EventPayloads[T]) => void
  ): void;
  trigger<T extends keyof EventPayloads>(
    event: T,
    payload?: EventPayloads[T]
  ): () => void;
}

/* ========== Данные ========== */
export interface IProduct {
  id: string;
  name: string;
  cost: number;
  desc?: string;
  img_url: string;
  category: string;
}

/* ========== Состояния ========== */
export interface IAppState {
  products: IProduct[];
  cart: IProduct[];
  currentProduct: IProduct | null;
}

/* ========== События ========== */
export enum AppEvents {
  PRODUCTS_LOADED = 'products:loaded',
  CART_UPDATED = 'cart:updated',
  PRODUCT_PREVIEW = 'product:preview'
}

export type EventPayloads = {
  [AppEvents.PRODUCTS_LOADED]: IProduct[];
  [AppEvents.CART_UPDATED]: IProduct[];
  [AppEvents.PRODUCT_PREVIEW]: IProduct | null;
};

/* ========== Модели ========== */
export interface IProductModel {
  products: IProduct[];
  preview: IProduct | null; 
  setProducts(products: IProduct[]): void;
  getProduct(id: string): IProduct | undefined;
  setPreview(product: IProduct | null): void;
}

export interface ICartModel {
  items: IProduct[];
  totalPrice: number;
  addItem(product: IProduct): void;
  removeItem(productId: string): void;
  clearCart(): void;
}

export interface IOrderModel {
  address: string;
  contactData: { name: string; phone: string };
  items: IProduct[];
  setAddress(address: string): void;
  setContactData(data: { name: string; phone: string }): void;
  validate(): boolean;
}

/* ========== API ========== */
export interface ICommerceAPI {
  getProducts(): Promise<IProduct[]>;
  getProductById(id: string): Promise<IProduct>;
  createOrder(orderData: Omit<IOrderModel, 'validate'>): Promise<void>;
}

/* ========== Компоненты ========== */
export interface IProductCardProps {
  product: IProduct;
  onAddToCart: () => void;
  onPreview: () => void;
}

export interface ICartViewProps {
  items: IProduct[];
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}
