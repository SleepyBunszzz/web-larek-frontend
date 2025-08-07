// Тип одного товара (полный)
export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
};

// Элемент корзины — товар с количеством
export interface CartItem extends Pick<Product, 'id' | 'title' | 'price'> {
  quantity: number;
}

// Корзина — список товаров и итоговая сумма
export interface Cart {
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
export type ProductList = Product[];

// Тип для карточки товара на главной странице
export type ProductCard = Pick<Product, 'id' | 'title' | 'price' | 'category' | 'image'>;

// Тип для предпросмотра товара в модальном окне
export type ProductPreview = Pick<Product, 'id' | 'title' | 'description' | 'price' | 'category' | 'image'>;

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

// Информация о заказе по ID (подробная)
export type OrderInfo = {
  id: string;
  payment: 'card' | 'cash';
  address: string;
  email?: string;
  phone?: string;
  total: number;
  items: Product[];
  createdAt: string;
};


