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
## Данные и типы данных, используемые в приложении

Тип одного товара (полный)

```
export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
}
```

Элемент корзины — товар с количеством

```
export interface CartItem extends Pick<Product, 'id' | 'title' | 'price'> {
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

Тип данных для формы контактов

```
export interface ContactData {
  email: string;
  phone: string;
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

Информация о заказе по ID (подробная)

```
export type OrderInfo = {
  id: string;
  payment: 'card' | 'cash';
  address: string;
  email?: string;
  phone?: string;
  total: number;
  items: Product[];
  createdAt: string;
}
```


## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
-слой представления, отвечает за отображение данных на страницеж
-слой данных, отвечает за хранение и ищменение данныхж
-презентор, отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запроса. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы:
- `get` - вылолняет GET запрос на переданный в параметрах етдпоинт и возвращает промис с объектом, которым ответил сервер,
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на эдпоинт переданный как параметр при вызове метода. По умолчанию выполнятеся `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий повзоляет отправить события и подписаться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие;
- `emit` - инициализация события;
- `trigger` - возвращает функцию, при выозе которой инициалищируется требуемое в параметрах событие.