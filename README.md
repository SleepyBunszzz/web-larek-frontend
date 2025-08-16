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
```
Данные

```
export interface IProduct {
  id: string;
  name: string;
  cost: number;
  desc?: string;
  img_url: string;
  category: string;
}
```

Состояния

```
export interface IAppState {
  products: IProduct[];
  cart: IProduct[];
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
  [AppEvents.CART_UPDATED]: IProduct[];
  [AppEvents.PRODUCT_PREVIEW]: IProduct | null;
};
```

Модели

```
export interface IProductModel {
  products: IProduct[];
  preview: IProduct | null; // Хранит весь продукт, не только ID
  setProducts(products: IProduct[]): void;
  getProduct(id: string): IProduct | undefined;
  setPreview(product: IProduct | null): void;
}

export interface ICartModel {
  items: IProduct[]; // Без quantity
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
```

API

```
export interface ICommerceAPI extends IApiClient {
  getProducts(): Promise<IProduct[]>;
  createOrder(orderData: Omit<IOrderModel, 'validate'>): Promise<void>;
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
  items: IProduct[];
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

#### Класс IProductModel
Отвечает за хранение списка товаров, поиск и удаление.
Поля:
- products: IProduct[] — массив загруженных товаров.
- preview: IProduct | null — товар, выбранный для предпросмотра (хранит весь объект товара).
- 
Методы:
- setProducts(products: IProduct[]): void - сохраняет массив товаров (используется после загрузки с сервера)
- getProduct(id: string): IProduct | undefined - возвращает товар по ID
- setPreview(product: IProduct | null): void - устанавливает товар для предпросмотра
  
#### Класс ICartModel
Отвечает за управление состояние корзины, расчет итоговой суммы.
Поля:
- items: IProduct[] — массив товаров в корзине.
- totalPrice: number — общая стоимость товаров в корзине.

Методы:
- addItem(product: IProduct): void - добавляет товар в корзину
- removeItem(productId: string): void - удаляет товар из корзины
- clearCart(): void - полностью очищает корзину

#### Класс IOrderModel
Отвечает за оформление заказов, валидацию данных пользователя и отправку информации на сервер. Используется на шаге оформления заказа.
Поля:
- address: string - адрес доставки
- contactData: { name: string; phone: string } - контактные данные покупателя
- items: IProduct[] - товары из корзины

Методы:
- setAddress(address: string): void - сохраняет адрес
- setContactData(data: { name: string; phone: string }): void - сохраняет контактные данные
- validate(): boolean - проверяет корректность всех данных перед оформлением

### API слой

#### Класс ICommerceAPI
Интерфейс клиента для взаимодействия с API.

Методы:
- getProducts(): Promise<IProduct[]> — получает список всех товаров
- getProductById(id: string): Promise<IProduct> — получает один товар по ID
- createOrder(orderData: Omit<IOrderModel, 'validate'>): Promise<void> — возвращает Promise<void>.

### Представления (Views)

#### Класс ProductListView
Отображает список товаров. 
Генерирует события:
- product:preview - при выборе товара для детального просмотра
- cart:add - при добавлении товара в корзину

#### Класс ProductCardView
Рендерит карточку отдельного товара. 
Принимает:
- product: IProduct - данные товара
- onPreview: () => void - обработчик просмотра деталей
- onAddToCart: () => void - обработчик добавления в корзину

#### Класс CartView
Отображает содержимое корзины. 
Принимает:
- items: CartItem[] - список товаров
- onRemove: (id: string) => void - обработчик удаления товара
- onCheckout: () => void - обработчик перехода к оформлению

#### Класс OrderFormView
Отображает форму оформления заказа. 
Генерирует события:
- order:submit - при отправке формы
- form:change - при изменении данных в форме

#### Класс ModalView
Универсальный компонент модального окна. 
Методы:
- open(content: HTMLElement): void - открывает модальное окно с переданным содержимым
- close(): void - закрывает модальное окно
- setTitle(title: string): void - устанавливает заголовок окна

### Презентер
В проекте используется один презентер, код которого находится в index.ts.
Презентер координирует взаимодействие между моделями и представлениями:
1. Подписывается на события от View
2. Обновляет модели данных
3. Управляет отображением модальных окон
4. Инициирует загрузку данных через CommerceAPI
5. Обновляет View при изменениях в моделях

Основной поток:
- При загрузке страницы загружает товары через CommerceAPI → сохраняет в ProductModel → обновляет ProductListView
- При добавлении в корзину обновляет CartModel → обновляет CartView
- При оформлении заказа валидирует данные через OrderModel → отправляет на сервер через CommerceAPI