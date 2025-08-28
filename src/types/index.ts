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

/* ========== Платёж ========== */
export type PaymentMethod = 'card' | 'cash';

/* ========== Данные API (что отдает сервер) ========== */
export type ApiProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
};

/* ========== Нормализованные данные приложения ========== */
export interface IProduct {
  id: string;
  name: string;
  cost: number;     // ← ApiProduct.price
  desc: string;     // ← ApiProduct.description
  img_url: string;  // ← ApiProduct.image (может идти через CDN)
  category: string; // ← ApiProduct.category
}

/* ========== (Опционально) состояние верхнего уровня ========== */
export interface IAppState {
  products: IProduct[];
  cart: IProduct[];
}

/* ========== События приложения ========== */
export enum AppEvents {
  PRODUCTS_LOADED = 'products:loaded',
  PRODUCT_PREVIEW = 'product:preview',

  CART_UPDATED = 'cart:updated',

  BASKET_OPEN = 'basket:open',
  ORDER_OPEN = 'order:open',
  MODAL_OPEN = 'modal:open',
  MODAL_CLOSE = 'modal:close',

  // Оформление заказа (шаг 1)
  ORDER_ADDRESS_CHANGED = 'order.address:changed',
  ORDER_SUBMITTED = 'order:submitted',
  ORDER_PAYMENT_SELECTED = 'order:payment-selected',
}

export type EventPayloads = {
  /* ===== Каталог/превью ===== */
  [AppEvents.PRODUCTS_LOADED]: IProduct[];
  [AppEvents.PRODUCT_PREVIEW]: IProduct | null;

  /* ===== Корзина/счетчики ===== */
  [AppEvents.CART_UPDATED]: { items: string[]; total: number; count: number };

  /* ===== UI / модалки ===== */
  [AppEvents.BASKET_OPEN]: undefined;
  [AppEvents.ORDER_OPEN]: undefined;
  [AppEvents.MODAL_OPEN]: { content?: HTMLElement } | undefined;
  [AppEvents.MODAL_CLOSE]: undefined;

  /* ===== Шаг 1: адрес и оплата (View -> Presenter/Model) ===== */
  [AppEvents.ORDER_ADDRESS_CHANGED]: { address: string };
  [AppEvents.ORDER_PAYMENT_SELECTED]: { payment: PaymentMethod };
  [AppEvents.ORDER_SUBMITTED]: void;

  /* ===== Шаг 1: адрес и оплата (Model -> View) — добавлено ===== */
  'order.step1:state': {
    valid: boolean;
    errors: string;
    value: { payment: PaymentMethod | null; address: string };
  };

  /* ===== Шаг 2: контакты (View -> Presenter/Model) — как было ===== */
  'contacts.email:change': { field: 'email'; value: string };
  'contacts.phone:change': { field: 'phone'; value: string };
  'contacts.name:change': { field: 'name'; value: string }; // поле name опционально в шаблоне
  'contacts:submit': undefined;

  /* ===== Шаг 2: контакты (Model -> View) — добавлено ===== */
  'contacts:state': {
    valid: boolean;
    errors: string;
    value: { email: string; phone: string; name?: string };
  };
};

/* ========== Модели ========== */

// Продукты
export interface IProductModel {
  products: IProduct[];
  setProducts(productsRaw: unknown[]): void;
  getProduct(id: string): IProduct | undefined;
  setPreview(product: IProduct | null): void;
  readonly preview?: IProduct | null;
}

// Корзина
export interface ICartModel {
  items: IProduct[];
  addItem(product: IProduct): void;
  removeItem(productId: string): void;
  clearCart(): void;
  getTotal(): number;
}

// Заказ
export interface IOrderModel {
  payment: PaymentMethod | null;
  address: string;
  email: string;
  phone: string;

  setPayment(method: PaymentMethod | null): void;
  setAddress(address: string): void;
  setEmail(email: string): void;
  setPhone(phone: string): void;
  validate(): { valid: boolean; errors: string };
}

/* ========== API-слой ========== */
export type OrderPayload = {
  payment: PaymentMethod;
  address: string;
  email: string;
  phone: string;
  items: string[];
  total: number;
};

export interface ICommerceAPI extends IApiClient {
  getProducts(): Promise<unknown[]>;
  getProductById(id: string): Promise<unknown>;
  createOrder(order: OrderPayload): Promise<void>;
}

/* ========== пропсы для View-слоя ========== */
export interface IProductListViewProps {
  products: IProduct[];
  onPreview: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

export interface IProductCardProps {
  product: IProduct;
  onAddToCart: () => void;
  onPreview: () => void;
}

export interface IBasketProps {
  items: IProduct[];
  total: number;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export interface IBasketItemProps {
  index: number;
  id: string;
  title: string;
  price: number;
  onDelete: (id: string) => void;
}

export interface ICartViewProps {
  items: IProduct[];
  total: number;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
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

export interface IOrderAddressFormProps {
  payment: PaymentMethod | null;
  address: string;
  onChange: (data: { payment: PaymentMethod | null; address: string }) => void;
  onNext: () => void;
  errors?: string;
}

export interface IOrderContactsFormProps {
  email: string;
  phone: string;
  onChange: (data: { field: 'email' | 'phone' | 'name'; value: string }) => void;
  onSubmit: () => void;
  errors?: string;
}

export interface IFormSuccessProps {
  total: number;
  onClose: () => void;
}
