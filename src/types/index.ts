// Товар в каталоге
export type IProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
};

// Интерфейс для работы с каталогом товаров
export interface IProductsData {
  products: IProduct[];
  preview: string | null;
  addProduct(productId: IProduct): void;
  deleteProduct(productId: string, payload?: (product: IProduct) => void): void;
  lookProduct(productId: string, payload?: (product: IProduct) => void): void;
  getProduct(productId: string): IProduct;
}

// Элемент корзины — товар с количеством
export interface CartItem extends Pick<IProduct, 'id' | 'title' | 'price'> {
  quantity: number;
}

// Корзина — список товаров и итоговая сумма
export interface ICart {
  items: CartItem[];
  totalPrice: number;
}

// Тип данных для формы оплаты
export interface PaymentData {
  paymentMethod: 'card' | 'cash';
  deliveryAddress: string;
}

// Тип данных для формы контактов
export interface ContactData {
  email: string;
  phone: string;
}

// Тип ответа после успешного заказа
export interface OrderSuccess {
  orderId: string;
  totalPrice: number;
  message: string;
}

// Список товаров
export type ProductList = IProduct[];

// Тип для карточки товара на главной странице
export type ProductCard = Pick<IProduct, 'id' | 'title' | 'price' | 'category' | 'image'>;

// Тип для предпросмотра товара в модальном окне
export type ProductPreview = Pick<IProduct, 'id' | 'title' | 'description' | 'price' | 'category' | 'image'>;

// Тело запроса на создание заказа
export type OrderPayload = {
  payment: 'card' | 'cash';
  address: string;
  email?: string;
  phone?: string;
  items: string[]; // массив ID товаров
};

// Ответ от сервера после создания заказа
export type OrderResponse = {
  id: string;
};



