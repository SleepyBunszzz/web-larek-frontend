export interface IApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: unknown, method?: string): Promise<T>;
}

export interface IEventEmitter {
  on<T extends keyof EventPayloads>(
    event: T,
    callback: (payload: EventPayloads[T]) => void
  ): void;
  emit<T extends keyof EventPayloads>(event: T, payload?: EventPayloads[T]): void;
  off<T extends keyof EventPayloads>(
    event: T,
    callback: (payload: EventPayloads[T]) => void
  ): void;
  trigger<T extends keyof EventPayloads>(
    event: T,
    payload?: EventPayloads[T]
  ): () => void;
}


export type PaymentMethod = 'card' | 'cash';

export type ApiProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
};


export interface IProduct {
  id: string;
  name: string;
  cost: number;     
  desc: string;     
  img_url: string;  
  category: string;
}

export interface IAppState {
  products: IProduct[];
  cart: IProduct[];
}

export enum AppEvents {
  PRODUCTS_LOADED = 'products:loaded',
  PRODUCT_PREVIEW = 'product:preview',

  CART_UPDATED = 'cart:updated',

  BASKET_OPEN = 'basket:open',
  ORDER_OPEN = 'order:open',
  MODAL_OPEN = 'modal:open',
  MODAL_CLOSE = 'modal:close',

  ORDER_ADDRESS_CHANGED = 'order.address:changed',
  ORDER_PAYMENT_SELECTED = 'order:payment-selected',
  ORDER_SUBMITTED = 'order:submitted',
}

export type EventPayloads = {
  [AppEvents.PRODUCTS_LOADED]: IProduct[];
  [AppEvents.PRODUCT_PREVIEW]: IProduct | null;
  [AppEvents.CART_UPDATED]: { items: string[]; total: number; count: number } | undefined;
  [AppEvents.BASKET_OPEN]: undefined;
  [AppEvents.ORDER_OPEN]: undefined;
  [AppEvents.MODAL_OPEN]: { content?: HTMLElement } | undefined;
  [AppEvents.MODAL_CLOSE]: undefined;
  [AppEvents.ORDER_ADDRESS_CHANGED]: { address: string; payment?: PaymentMethod | null };
  [AppEvents.ORDER_PAYMENT_SELECTED]: { payment: PaymentMethod };
  [AppEvents.ORDER_SUBMITTED]: undefined;

  'order:changed': undefined;
  'contacts.email:change': { field: 'email'; value: string };
  'contacts.phone:change': { field: 'phone'; value: string };
  'contacts.field:blur': { field: 'email' | 'phone' };
  'contacts:submit': undefined;
};


export interface IProductModel {
  products: IProduct[];
  setProducts(products: IProduct[]): void;           
  getProduct(id: string): IProduct | undefined;
  setPreview(product: IProduct | null): void;
  readonly preview?: IProduct | null;
}

export interface ICartModel {
  items: IProduct[];
  addItem(product: IProduct): void;
  removeItem(productId: string): void;
  clearCart(): void;
  getTotal(): number;
}

export interface IOrderModel {
  payment: PaymentMethod | null;
  address: string;
  email: string;
  phone: string;

  setPayment(method: PaymentMethod | null): void;
  setAddress(address: string): void;
  setEmail(email: string): void;
  setPhone(phone: string): void;

  validateStep1(): { valid: boolean; errors: string };
  validateAll(): { valid: boolean; errors: string };
  reset(): void;
  toOrderFormState(): OrderFormState;
  toContactsFormState(): ContactsFormState;
}

export type OrderFormState = {
  payment: PaymentMethod | null;
  address: string;
  valid: boolean;
  errors: string;
};

export type ContactsFormState = {
  email: string;
  phone: string;
  valid: boolean;
  errors: string;
};

export type OrderPayload = {
  payment: PaymentMethod;
  address: string;
  email: string;
  phone: string;
  items: string[];
  total: number;
};

export type OrderResponse = {
  id: string;
  total: number;
};

export interface ICommerceAPI extends IApiClient {
  getProducts(): Promise<IProduct[]>;
  getProductById(id: string): Promise<IProduct>;
  createOrder(order: OrderPayload): Promise<OrderResponse>;
}

export interface IModalProps {
  content: HTMLElement;
  onClose?: () => void;
}

export interface IPageProps {
  cartCount: number;
  onOpenCart: () => void;
  productList: HTMLElement[];
}
