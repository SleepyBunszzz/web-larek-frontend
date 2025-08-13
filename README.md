# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

# Web-ларёк — интернет-магазин для веб-разработчиков

Web-ларёк — это SPA-приложение, в котором можно:
- просматривать каталог товаров;
- открывать детальную карточку товара;
- добавлять товары в корзину;
- оформлять заказ в два шага: адрес и контактные данные;
- получать подтверждение оформления заказа.

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных

Базовые типы

```
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
```
Данные API

```
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
```

Frontend типы

```
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
```

Состояния

```
export interface IAppState {
  products: IProduct[];
  cart: ICartItem[];
  currentProduct: IProduct | null;
}
```

События

```
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
```

Модели

```
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
```

Компоненты

```
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
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- Представления(View) - слой представления, отвечает за отображение данных на странице;
- Модели(Model) - слой данных, отвечает за хранение и изенение данных;
- Презентор(Presenter) - слой, отвечающий за связь представления и данных.


### Базовые классы

#### Класс Api
Содержит в себе базовую логику отправки запроса. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы:
- `get` - вылолняет GET запрос на переданный в параметрах етдпоинт и возвращает промис с объектом, которым ответил сервер.
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на эдпоинт, переданный, как параметр при вызове метода. По умолчанию выполнятеся `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.
Пример: загрузка товаров, оформление заказа.

class Api {
  constructor(baseUrl: string) {}
  get<T>(endpoint: string): Promise<T> {}
  post<T>(endpoint: string, data: unknown): Promise<T> {}
}

#### Класс EventEmitter
Брокер событий повзоляет отправить события и подписаться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие;
- `emit` - инициализация события;
- `trigger` - возвращает функцию, при выозе которой инициалищируется требуемое в параметрах событие.

class EventEmitter {
  on(event: string, callback: Function): void {}
  emit(event: string, payload?: any): void {}
  off(event: string, callback: Function): void {}
}

### Модели данных

#### Класс ProductModel
Отвечает за хранение списка товаров, поиск и удаление.
Поля:
- products: IProduct[] — список товаров.
- preview: string | null — ID товара для предпросмотра.
- 
Методы:
- addProduct(product: IProduct) — добавляет товар.
- deleteProduct(id: string, payload?: Function) — удаляет товар.
- lookProduct(id: string, payload?: Function) — устанавливает товар для предпросмотра.
- getProduct(id: string): IProduct — возвращает товар по ID.
  
#### Класс CartModel
Отвечает за управление состояние корзины, расчет итоговой суммы.
Поля:
- items: CartItem[] — товары в корзине.
- totalPrice: number — общая стоимость.

Методы:
- addToCart(product: IProduct) — добавляет товар.
- removeFromCart(id: string) — удаляет товар.
- clearCart() — очищает корзину.

#### Класс OrderModel
Отвечает за оформление заказов, валидацию данных пользователя и отправку информации на сервер. Используется на шаге оформления заказа.
Методы:
- createOrder(address: string, contactData: { name: string; phone: string }): Promise<void> — формирует заказ на основе введённого адреса, контактных данных и текущих товаров из корзины, отправляет заказ на сервер.
- validateAddress(address: string): boolean — проверяет корректность введённого адреса (не пустой, минимальная длина, правильный формат).
- validateContactData(contactData: { name: string; phone: string }): boolean — проверяет корректность имени и телефона пользователя.

### Представления (View)
Каждое представление отвечает за свой участок интерфейса:
- ProductListView — список товаров.
- ProductCardView — карточка товара.
- CartView — корзина.
- ModalView — модальные окна.

### Презентер
В проекте используется один презентер, код которого находится в index.ts.
Подписывается на события от View, вызывает методы моделей, передаёт данные обратно в View.
Управляет модалками и сценарием оформления заказа.