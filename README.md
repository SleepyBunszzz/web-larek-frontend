# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS/TS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения (презентер)
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

# Web-ларёк — интернет-магазин для веб-разработчиков

Web-ларёк — это SPA-приложение, в котором можно:
- просматривать каталог товаров;
- открывать детальную карточку товара;
- добавлять/удалять товары в корзину;
- оформлять заказ в два шага: адрес и контактные данные;
- получать подтверждение оформления заказа (сумма из ответа сервера).

## Установка и запуск

```bash
npm install
npm run start
# или
yarn
yarn start
```

## Сборка

```bash
npm run build
# или
yarn build
```

## Данные и типы данных

### Базовые типы

```ts
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
```

### Данные API

Сервер возвращает объекты следующей структуры:

```ts
export type ApiProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
};
```

Во внутренней модели приложения данные нормализуются к:

```ts
export interface IProduct {
  id: string;
  name: string;
  cost: number;     // из ApiProduct.price
  desc: string;     // из ApiProduct.description
  img_url: string;  // из ApiProduct.image
  category: string; // из ApiProduct.category
}
```

### Платёж / заказ

```ts
export type PaymentMethod = 'card' | 'cash';

export type OrderPayload = {
  payment: PaymentMethod;
  address: string;
  email: string;
  phone: string;
  items: string[];  // id товаров
  total: number;    // локально подсчитанная сумма корзины
};

export type OrderResponse = {
  id: string;       // id заказа на сервере
  total: number;    // сумма к оплате по мнению сервера
};
```

## Архитектура приложения

Код разделён на слои согласно парадигме MVP:
- **Представления (View)** — отображение данных и эмит UI-событий;
- **Модели (Model)** — хранение и изменение данных, валидация;
- **Презентер (Presenter)** — связывает View и Model, маршрутизирует события.

### События

```ts
export enum AppEvents {
  PRODUCTS_LOADED         = 'products:loaded',
  PRODUCT_PREVIEW         = 'product:preview',

  CART_UPDATED            = 'cart:updated',
  BASKET_OPEN             = 'basket:open',
  ORDER_OPEN              = 'order:open',
  MODAL_OPEN              = 'modal:open',
  MODAL_CLOSE             = 'modal:close',

  ORDER_ADDRESS_CHANGED   = 'order.address:changed',
  ORDER_PAYMENT_SELECTED  = 'order:payment-selected',
  ORDER_SUBMITTED         = 'order:submitted',
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
```

### Базовые классы

#### Класс `Api`
Содержит базовую логику запросов. В конструктор передаётся базовый URL и опциональные заголовки.

- `get(endpoint)` — GET-запрос, возвращает `Promise<T>`.
- `post(endpoint, data, method='POST')` — POST/PUT/PATCH с JSON-телом, возвращает `Promise<T>`.

#### Класс `EventEmitter`
Брокер событий. Используется в презентере и во View:

- `on(event, cb)` — подписка;
- `emit(event, data?)` — эмит события;
- `off(event, cb)` — отписка;
- `trigger(event, payload?) => () => void` — фабрика колбэка.

#### Класс `Component<TState>`
Базовый класс для всех View: хранение состояния и helpers (`setText`, `setImage`, `setDisabled`, `toggleClass`, `setHidden`, `setVisible`).

#### Класс `BaseForm`
Единый базовый класс форм. Содержит submit-кнопку, контейнер ошибок и сеттеры `valid`/`errors`. Используется `OrderForm` и `ContactsForm`.

### Модели данных

#### Класс `ProductModel`

Отвечает за хранение списка товаров и доступ к товару по идентификатору. Также нормализует данные из API к `IProduct`.

**Поля (приватные):**
- `_products: IProduct[]`
- `_preview: IProduct | null`

**Геттеры:**
- `products: IProduct[]`
- `preview: IProduct | null`

**Методы:**
- `setProducts(products: ApiProduct[] | IProduct[])`
- `getProduct(id: string)`
- `setPreview(product: IProduct | null)`

#### Класс `CartModel`

Отвечает за управление состоянием корзины и расчёт итоговой суммы.

**Поля:**
- `items: IProduct[]`

**Методы:**
- `addItem(product: IProduct)`
- `removeItem(productId: string)`
- `clearCart()`
- `getTotal(): number`

#### Класс `OrderModel`

Хранит и валидирует данные двух шагов. Также хранит UI-флаги показа ошибок.

**Поля:**
- `payment: PaymentMethod | null`
- `address: string`
- `email: string`
- `phone: string`
- `_step1ShowErrors: boolean`
- `_step2ShowErrors: boolean`
- `_lastContactsBlur: 'email' | 'phone' | null`

**Методы:**
- `setPayment`, `setAddress`, `setEmail`, `setPhone`
- `setStep1ShowErrors`, `setStep2ShowErrors`, `setLastContactsBlur`
- `validateStep1()`, `validateContacts(prefer?)`, `validateAll()`
- `toOrderFormState()`, `toContactsFormState()`
- `reset()`

### Представления (Views)

Классы отображают данные внутри контейнеров. Все наследуются от `Component` или специализированных базовых классов.

#### Класс `Page`
Контейнер главной страницы: каталог, корзина в шапке, блокировка скролла.

**Поля:**
- `_counter: HTMLElement` — .header__basket-counter
- `_catalog: HTMLElement` — .gallery
- `_wrapper: HTMLElement` — .page__wrapper
- `_basket: HTMLElement` — .header__basket

**Методы:**
- `constructor(container: HTMLElement, events: IEventEmitter)` — вешает клик на корзину → `events.emit('basket:open')`
- `set counter(value: number)` — обновляет число в шапке
- `set catalog(items: HTMLElement[])` — перерисовывает каталог
- `set locked(value: boolean)` — тогглит класс .page__wrapper_locked
- `render({ counter, catalog, locked })` — вызывает сеттеры и возвращает контейнер

---

#### Класс `Modal`
Реализует модальное окно. Управляет открытием/закрытием, устанавливает слушатели на клик **по фону и кнопке-крестику**.

**Поля:**
- `_closeButton: HTMLButtonElement` — кнопка закрытия
- `_content: HTMLElement` — контейнер содержимого

**Методы:**
- `constructor(container: HTMLElement, events: IEventEmitter)`
- `open()` — открыть модалку
- `close()` — закрыть модалку
- `set content(node: HTMLElement)` — вставить содержимое
- внутри эмитит `modal:open` / `modal:close`

---

#### Класс `BaseProductCard<T extends IProduct>`
Базовый родитель карточек товара: id, название, цена, изображение, категория.

**Поля:**
- `_id: string | null`
- `title?: HTMLElement` — .card__title
- `category?: HTMLElement` — .card__category
- `price?: HTMLElement` — .card__price
- `image?: HTMLImageElement` — .card__image

**Методы:**
- `applyBase(data: IProduct)` — переносит id/name/cost/img_url/category в DOM и выставляет CSS-модификатор категории

---

#### Класс `ProductCard`
Карточка в каталоге. Кликабельна (открывает предпросмотр).

**Поля:**
- наследует поля `BaseProductCard`

**Методы:**
- `constructor(container, { onPreview? })` — вешает обработчик на корневой элемент → вызывает `onPreview(id)`
- `render(product: IProduct)` — вызывает `applyBase(product)`, возвращает `this.el`

---

#### Класс `ProductCardPreview`
Карточка предпросмотра: описание, цена, кнопка купить/убрать.

**Поля:**
- `text?: HTMLElement` — описание (.card__text / .card__description)
- `btn?: HTMLButtonElement` — кнопка (.card__button / `[data-role="toggle-cart"]`)
- + поля `BaseProductCard`

**Методы:**
- `constructor(container, { onToggleCart })` — вешает клик на кнопку → вызывает `onToggleCart(id)`
- `render(product: IProduct & { inCart?: boolean })` — применяет `applyBase`, обновляет описание и цену, меняет кнопку:
  - «Недоступно» если `cost <= 0`
  - «Купить» / «Убрать из корзины» если `cost > 0`

---

#### Класс `Basket`
Модальное представление корзины.

**Поля:**
- `_list: HTMLElement` — .basket__list
- `_total: HTMLElement` — .basket__price
- `_button: HTMLElement` — .basket__button
- `events: EventEmitter`

**Методы:**
- `constructor(container, events)` — вешает клик на кнопку → `events.emit('order:open')`
- `set items(items: HTMLElement[])` — рендерит список или «Корзина пуста»
- `set selected(ids: string[])` — дизейблит кнопку при пустой корзине
- `set total(total: number)` — показывает итог
- `render({ items, total, selected })` — вызывает сеттеры, возвращает контейнер

> Важно: **при открытии корзины** мы только показываем текущее состояние в модалке; перерисовка корзины и счётчика в шапке происходит **только** по событию модели `'cart:changed'`.

---

#### Класс `BasketItemView`
Элемент списка корзины.

**Поля:**
- `indexEl: HTMLElement` — порядковый номер
- `deleteBtn?: HTMLButtonElement` — кнопка удаления
- + поля `BaseProductCard`

**Методы:**
- `constructor(container, { index, onDelete })` — находит элементы, вешает обработчик на кнопку удаления
- `render(product: IProduct)` — применяет `applyBase`, рендерит порядковый номер

---

#### Класс `OrderForm`
Форма шага 1: адрес и оплата.

**Поля:**
- `inputAddress: HTMLInputElement` — `input[name="address"]`
- `btnCard: HTMLButtonElement` — `button[name="card"]`
- `btnCash: HTMLButtonElement` — `button[name="cash"]`
- унаследованные `submitBtn`/`errorsEl` из `BaseForm`

**Методы:**
- `constructor(container, events)` — эмитит:
  - `ORDER_ADDRESS_CHANGED` (при вводе адреса)
  - `ORDER_PAYMENT_SELECTED` (при клике по способу оплаты)
  - `ORDER_SUBMITTED` (submit формы)
- `render(state: OrderFormState)` — применяет `payment/address/valid/errors`, возвращает форму

---

#### Класс `ContactsForm`
Форма шага 2: контакты (email + phone).

**Поля:**
- `inputEmail: HTMLInputElement` — `input[name="email"]`
- `inputPhone: HTMLInputElement` — `input[name="phone"]`
- унаследованные `submitBtn`/`errorsEl` из `BaseForm`

**Методы:**
- `constructor(container, events)` — эмитит:
  - `'contacts.email:change'` / `'contacts.phone:change'` — при вводе
  - `'contacts.field:blur'` — при уходе из любого поля (первое действие на шаге 2)
  - `'contacts:submit'` — при отправке формы
- `render(state: ContactsFormState & { showErrors?: boolean })` — применяет значения полей, `valid/errors`

---

#### Класс `SuccessView`
Экран успешного заказа.

**Поля:**
- `totalEl: HTMLElement` — `.order-success__description`
- `closeBtn: HTMLButtonElement` — `.order-success__close`

**Методы:**
- `render({ total, onClose })` — показывает сумму **из ответа сервера**, вешает обработчик закрытия

### Презентер

Расположен в `src/index.ts`.

Задачи:
1. Загрузка товаров из API и помещение в `ProductModel` (нормализация в модели).
2. Рендер каталога/корзины/шапки. Перерисовка корзины и счётчика — **только** по `'cart:changed'`.
3. Реакция на события UI: превью, добавление/удаление из корзины, ввод адреса/контактов, выбор оплаты.
4. Универсальный перерисовщик по событию модели `order:changed` — перерисовка `OrderForm` и `ContactsForm` без насильного скрытия ошибок (флаги внутри модели).
5. Управление модалками (basket → step1 → step2 → success).
6. Сабмит шага 2: `api.createOrder(payload)` → показываем сумму из `OrderResponse.total`, очищаем корзину, сбрасываем заказ.

### API

Маппинг `ApiProduct → IProduct` выполняет **модель**.

```ts
export interface ICommerceAPI extends IApiClient {
  getProducts(): Promise<ApiProduct[]>;
  getProductById(id: string): Promise<ApiProduct>;
  createOrder(order: OrderPayload): Promise<OrderResponse>;
}
```

Цепочка: `Presenter -> api.getProducts() -> productModel.setProducts(raw) -> View`.
