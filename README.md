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

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- слой представления, отвечает за отображение данных на странице;
- слой данных, отвечает за хранение и изенение данных;
- презентор, отвечает за связь представления и данных.

Основные части:
- Модели данных (Model) - хранят и изменяют состояние приложения (каталог, корзина, заказ).
- Представления (View) - pендерят интерфейс на основе данных из моделей.
- Презентер (Presenter) - обрабатывает события, связывает View и Model.
- API - обеспечивает обмен данными с сервером.
- Брокер событий - позволяет слоям общаться без прямой зависимости.

## Данные и типы данных

В приложении используются два ключевых интерфейса данных:

IProduct — товар, который описывает товар в каталоге и в заказах.

```
export type IProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
}
```

ContactData — покупатель. Хранит данные покупателя для оформления заказа.

```
export interface ContactData {
  email: string;
  phone: string;
}

```
Элемент корзины — товар с количеством

```
export interface CartItem extends Pick<IProduct, 'id' | 'title' | 'price'> {
  quantity: number;
}
```

Корзина — список товаров и итоговая сумма

```
export interface Cart {
  items: CartItem[];
  totalPrice: number;
}
```

Тип данных для формы оплаты

```
export interface PaymentData {
  paymentMethod: 'card' | 'cash';
  deliveryAddress: string;
}
```

Тип ответа после успешного заказа

```
export interface OrderSuccess {
  orderId: string;
  totalPrice: number;
  message: string;
}
```

Список товаров

```
export type ProductList = Product[]
```

Тип для карточки товара на главной странице

```
export type ProductCard = Pick<Product, 'id' | 'title' | 'price' | 'category' | 'image'>
```

Тип для предпросмотра товара в модальном окне

```
export type ProductPreview = Pick<Product, 'id' | 'title' | 'description' | 'price' | 'category' | 'image'>
```

Тело запроса на создание заказа

```
export type OrderPayload = {
  payment: 'card' | 'cash';
  address: string;
  email?: string;
  phone?: string;
  items: string[];
}
```

Ответ от сервера после создания заказа

```
export type OrderResponse = {
  id: string;
}
```


### Базовые классы

#### Класс Api
Содержит в себе базовую логику отправки запроса. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы:
- `get` - вылолняет GET запрос на переданный в параметрах етдпоинт и возвращает промис с объектом, которым ответил сервер (get(endpoint: string): Promise<T>).
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на эдпоинт, переданный, как параметр при вызове метода. По умолчанию выполнятеся `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.
Пример: загрузка товаров, оформление заказа (post(endpoint: string, data: object, method = 'POST'): Promise<T>).

#### Класс EventEmitter
Брокер событий повзоляет отправить события и подписаться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие (on(event: string, callback: Function));
- `emit` - инициализация события (emit(event: string, payload?: any));
- `trigger` - возвращает функцию, при выозе которой инициалищируется требуемое в параметрах событие (trigger(event: string)).

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
Поля:
- items: CartItem[] — товары в корзине.
- totalPrice: number — общая стоимость.

Методы:
- addToCart(product: IProduct) — добавляет товар.
- removeFromCart(id: string) — удаляет товар.
- clearCart() — очищает корзину.
  
### Представления (View)
Каждое представление отвечает за свой участок интерфейса:
- ProductListView — список товаров.
- ProductCardView — карточка товара.
- CartView — корзина.
- OrderFormView — форма оформления заказа.
- ModalView — модальные окна.

### Презентер
В проекте используется один презентер, код которого находится в index.ts.
Он подписывается на события от View и вызывает методы моделей.