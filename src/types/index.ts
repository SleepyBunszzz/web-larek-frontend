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
  PRODUCT_PREVIEW = 'product:preview',
  CART_UPDATED = 'cart:updated',

  ORDER_ADDRESS_CHANGED = 'order.address:changed',
  ORDER_CONTACTS_CHANGED = 'order.contacts:changed',
  ORDER_SUBMITTED = 'order:submitted',

  FORM_ERROR = 'form:error',

  MODAL_OPEN = 'modal:open',
  MODAL_CLOSE = 'modal:close',
}

export type EventPayloads = {
  [AppEvents.PRODUCTS_LOADED]: IProduct[];
  [AppEvents.PRODUCT_PREVIEW]: IProduct | null;
  [AppEvents.CART_UPDATED]: IProduct[];

  [AppEvents.ORDER_ADDRESS_CHANGED]: { payment: PaymentMethod; address: string };
  [AppEvents.ORDER_CONTACTS_CHANGED]: { email: string; phone: string };
  [AppEvents.ORDER_SUBMITTED]: undefined;

  [AppEvents.FORM_ERROR]: { message: string };

  [AppEvents.MODAL_OPEN]: { content?: HTMLElement } | undefined;
  [AppEvents.MODAL_CLOSE]: undefined;
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
  addItem(product: IProduct): void;
  removeItem(productId: string): void;
  clearCart(): void;
  getTotal(): number;
}

export type PaymentMethod = 'card' | 'cash';

export interface IOrderModel {
  payment?: PaymentMethod;
  address: string;
  contactData: { name: string; phone: string };
  items: IProduct[];
  setPayment(method: PaymentMethod): void;
  setAddress(address: string): void;
  setContactData(data: { name: string; phone: string }): void;
  setItems(items: IProduct[]): void;
  validate(): boolean;
}

/* ========== API ========== */
export type OrderPayload = {
  payment: 'card' | 'cash';
  address: string;
  email: string;
  phone: string;
  items: string[];
};

export interface ICommerceAPI extends IApiClient {
  getProducts(): Promise<IProduct[]>;
  getProductById(id: string): Promise<IProduct>;
  createOrder(order: OrderPayload): Promise<void>;
}

/* ========== Компоненты ========== */
// Список товаров
export interface IProductListViewProps {
  products: IProduct[];
  onPreview: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

// Карточка товара
export interface IProductCardProps {
  product: IProduct;
  onAddToCart: () => void;
  onPreview: () => void;
}

// Корзина целиком (контент для модалки)
export interface IBasketProps {
  items: IProduct[];
  total: number;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

// Строка корзины
export interface IBasketItemProps {
  index: number;
  id: string;
  title: string;
  price: number;
  onDelete: (id: string) => void;
}

// Отдельное представление корзины (если используется)
export interface ICartViewProps {
  items: IProduct[];
  total: number;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

// Модалка
export interface IModalProps {
  content: HTMLElement;
  onClose?: () => void;
}

// Главная страница
export interface IPageProps {
  cartCount: number;
  onOpenCart: () => void;
  productList: HTMLElement;
}

// Форма — шаг 1 (оплата и адрес)
export interface IOrderAddressFormProps {
  payment: PaymentMethod;
  address: string;
  onChange: (data: { payment: PaymentMethod; address: string }) => void;
  onNext: () => void;
  errors?: string;
}

// Форма — шаг 2 (контакты)
export interface IOrderContactsFormProps {
  email: string;
  phone: string;
  onChange: (data: { email: string; phone: string }) => void;
  onSubmit: () => void;
  errors?: string;
}

// Успех
export interface IFormSuccessProps {
  total: number;
  onClose: () => void;
}
