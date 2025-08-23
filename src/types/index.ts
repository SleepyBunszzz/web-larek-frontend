/* ========== Базовые типы ========== */
export interface IApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: unknown, method?: string): Promise<T>;
}

export type PaymentMethod = 'card' | 'cash';

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
  BASKET_OPEN = 'basket:open',
  ORDER_OPEN = 'order:open',
  MODAL_OPEN = 'modal:open',
  MODAL_CLOSE = 'modal:close',

  // Оформление заказа (шаг 1)
  ORDER_ADDRESS_CHANGED = 'order.address:changed',
  ORDER_SUBMITTED = 'order:submitted',
  ORDER_CHANGED = 'order:changed',

  // Контакты (шаг 2)
  CONTACTS_NAME_CHANGED = 'contacts.name:change',
  CONTACTS_EMAIL_CHANGED = 'contacts.email:change',
  CONTACTS_PHONE_CHANGED = 'contacts.phone:change',
  CONTACTS_SUBMIT = 'contacts:submit',
  ORDER_CONTACTS_CHANGED = 'order.contacts:changed',
  FORM_ERROR = 'form:error',
}

export type EventPayloads = {
  [AppEvents.PRODUCTS_LOADED]: IProduct[];
  [AppEvents.PRODUCT_PREVIEW]: IProduct | null;
  [AppEvents.CART_UPDATED]: IProduct[];
  [AppEvents.BASKET_OPEN]: undefined;
  [AppEvents.ORDER_OPEN]: undefined;
  [AppEvents.MODAL_OPEN]: { content?: HTMLElement } | undefined;
  [AppEvents.MODAL_CLOSE]: undefined;

  // Оформление заказа (шаг 1)
  [AppEvents.ORDER_ADDRESS_CHANGED]: { payment: PaymentMethod | null; address: string };
  [AppEvents.ORDER_SUBMITTED]: undefined;
  [AppEvents.ORDER_CHANGED]: undefined;

  // Контакты (шаг 2)
  [AppEvents.CONTACTS_NAME_CHANGED]: { field: 'name'; value: string };
  [AppEvents.CONTACTS_EMAIL_CHANGED]: { field: 'email'; value: string };
  [AppEvents.CONTACTS_PHONE_CHANGED]: { field: 'phone'; value: string };
  [AppEvents.CONTACTS_SUBMIT]: undefined;
  [AppEvents.ORDER_CONTACTS_CHANGED]: { name: string; email: string; phone: string };
  [AppEvents.FORM_ERROR]: { message: string };
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

export interface IOrderModel {
  payment: PaymentMethod | null;
  address: string;
  name: string;
  email: string;
  phone: string;

  setPayment(method: PaymentMethod): void;
  setAddress(address: string): void;
  setName(name: string): void;
  setEmail(email: string): void;
  setPhone(phone: string): void;
  validate(): boolean;
}

/* ========== API ========== */
export type OrderPayload = {
  payment: PaymentMethod;
  address: string;
  name: string;
  email: string;
  phone: string;
  items: string[];
  total: number;
};

export interface ICommerceAPI extends IApiClient {
  getProducts(): Promise<IProduct[]>;
  getProductById(id: string): Promise<IProduct>;
  createOrder(order: OrderPayload): Promise<void>;
}

/* ========== Компоненты ========== */
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
  productList: HTMLElement;
}

export interface IOrderAddressFormProps {
  payment: PaymentMethod | null;
  address: string;
  onChange: (data: { payment: PaymentMethod | null; address: string }) => void;
  onNext: () => void;
  errors?: string;
}

export interface IOrderContactsFormProps {
  name?: string;
  email: string;
  phone: string;
  onChange:
    | ((data: { name: string; email: string; phone: string }) => void)
    | ((data: { field: 'name' | 'email' | 'phone'; value: string }) => void);
  onSubmit: () => void;
  errors?: string;
}

export interface IFormSuccessProps {
  total: number;
  onClose: () => void;
}
