/* ========== Базовые типы ========== */
export interface IApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(
    endpoint: string,
    data: unknown,
    method?: string
  ): Promise<T>; // метод запроса может быть переопределён
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

/* ========== Данные API ========== */
export type ApiProduct = {
  id: string;
  name: string;
  cost: number;
  desc?: string;
  img_url: string;
  category: string;
};

export type ApiCartItem = {
  product_id: string;
  quantity: number;
};

/* ========== Frontend типы ========== */
export interface IProduct {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export interface ICartItem {
  product: Pick<IProduct, 'id' | 'title' | 'price'>;
  quantity: number;
}

/* ========== Состояния ========== */
export interface IAppState {
  products: IProduct[];
  cart: ICartItem[];
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
  [AppEvents.CART_UPDATED]: ICartItem[];
  [AppEvents.PRODUCT_PREVIEW]: IProduct | null;
};

/* ========== Модели ========== */
export interface IProductModel {
  products: IProduct[];
  preview: string | null;
  addProduct(product: IProduct): void;
  deleteProduct(id: string, payload?: Function): void;
  lookProduct(id: string, payload?: Function): void;
  getProduct(id: string): IProduct | undefined;
}

export interface ICartModel {
  items: ICartItem[];
  totalPrice: number;
  addToCart(product: IProduct): void;
  removeFromCart(productId: string): void;
  clearCart(): void;
}

export interface IOrderModel {
  createOrder(
    address: string,
    contactData: { name: string; phone: string }
  ): Promise<void>;
  validateAddress(address: string): boolean;
  validateContactData(contactData: {
    name: string;
    phone: string;
  }): boolean;
}

/* ========== Компоненты ========== */
export interface IProductCardProps {
  product: IProduct;
  onAddToCart: () => void;
  onPreview: () => void;
}

export interface ICartViewProps {
  items: ICartItem[];
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}
