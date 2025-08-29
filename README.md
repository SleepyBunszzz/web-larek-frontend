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
  on<T extends keyof EventPayloads>(event: T, callback: (payload: EventPayloads[T]) => void): void;
  emit<T extends keyof EventPayloads>(event: T, payload: EventPayloads[T]): void;
  off<T extends keyof EventPayloads>(event: T, callback: (payload: EventPayloads[T]) => void): void;
  trigger<T extends keyof EventPayloads>(event: T, payload?: EventPayloads[T]): () => void;
}

``` 
 Данные API
 
 ```
 Сервер возвращает объекты следующей структуры: 
  type ApiProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}
```

В приложении данные приводятся к виду:

```
interface IProduct {
  id: string;
  name: string;
  cost: number;     // из ApiProduct.price
  desc: string;     // из ApiProduct.description
  img_url: string;  // из ApiProduct.image (через CDN при необходимости)
  category: string; // из ApiProduct.category
}
```
Платёж / заказ

```
type PaymentMethod = 'card' | 'cash';

type OrderPayload = {
  payment: PaymentMethod;
  address: string;
  email: string;
  phone: string;
  items: string[];
  total: number;
}
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- Представления(View) - слой представления, отвечает за отображение данных на странице;
- Модели(Model) - слой данных, отвечает за хранение и изменение данных;
- Презентор(Presenter) - слой, отвечающий за связь представления и данных.

События

```
enum AppEvents {
  PRODUCTS_LOADED = 'products:loaded',
  PRODUCT_PREVIEW = 'product:preview',
  CART_UPDATED    = 'cart:changed,

  BASKET_OPEN     = 'basket:open',
  ORDER_OPEN      = 'order:open',
  MODAL_OPEN      = 'modal:open',
  MODAL_CLOSE     = 'modal:close',

  ORDER_ADDRESS_CHANGED   = 'order.address:changed',
  ORDER_PAYMENT_SELECTED  = 'order:payment-selected',
  ORDER_SUBMITTED         = 'order:submitted',
}
```

### Базовые классы

#### Класс Api
Содержит в себе базовую логику отправки запроса. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы:
- `get` - выполняет GET запрос на переданный в параметрах эндпоинт и возвращает промис с объектом, которым ответил сервер.
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на эндпоинт, переданный, как параметр при вызове метода. По умолчанию выполняется `POST` запрос
Пример: загрузка товаров, оформление заказа.

#### Класс EventEmitter
Брокер событий позволяет отправить события и подписаться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом EventEmitter (IEvents):
- `on(event: string|RegExp, cb: (data:any)=>void)` - подписка на событие;
- `emit(event: string, data?)` - инициализация события;
- `off(event: string|RegExp, cb)` — отписка от события.
- `trigger(event: string, context?) => (data)=>void` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие.

### Component<TState>
Базовый класс для всех представлений.

Поля:
- protected readonly el: HTMLElement — корневой элемент
- protected state: Partial<TState> — состояние

Методы:
- render(next?: Partial<TState>): HTMLElement — сливает state и вызывает onRender()
- protected onRender(): void — переопределяется потомками: «перенос state в DOM»
- protected setText(el, value) — устанавливает текст
- protected setImage(img, src, alt?) — устанавливает картинку
- protected setDisabled(el, disabled) — дизейблит кнопки/элементы
- protected toggleClass(el, className, force?)
- protected setHidden(el) / setVisible(el)
  
### Модели данных

#### Класс ProductModel
Отвечает за хранение списка товаров и доступ к товару по идентификатору.
Поля:
- products: IProduct[] — массив загруженных товаров.
- preview: IProduct | null — выбранный для предпросмотра товар.
  
Методы:
- setProducts(products: IProduct[]): void - сохраняет массив товаров (например, после загрузки из API)
- getProduct(id: string): IProduct | undefined - возвращает товар по ID
- setPreview(product: IProduct | null): void — сохранить выбранный товар
  
#### Класс CartModel
Отвечает за управление состоянием корзины, расчет итоговой суммы.
Поля:
- items: IProduct[] — массив товаров в корзине

Методы:
- addItem(product: IProduct): void - добавляет товар в корзину
- removeItem(productId: string): void - удаляет товар из корзины
- clearCart(): void - полностью очищает корзину
- getTotal() — возвращает общую стоимость

#### Класс OrderModel
Модель заказа хранит и валидирует данные двух шагов оформления (адрес/оплата и контакты). Используется презентером для подготовки состояний форм и проверки данных перед отправкой на сервер.

Поля:
- payment: PaymentMethod | null — способ оплаты
- address: string - адрес доставки
- email: string - электронная почта покупателя
- phone: string - номер телефона для связи.
- name?: string - необязательное поле имени (в шаблоне может отсутствовать).

Методы:
- setPayment(method: 'card' | 'cash'): void— сохранить выбранный способ оплаты
- setAddress(value: string): void — сохранить адрес доставки
- setEmail(value: string): void — сохранить электронную почту
- setPhone(value: string): void — сохранить телефон
- validate(): boolean — проверяет, что выбран способ оплаты, адрес и контакты (e-mail/телефон).
- validateStep1(): { valid: boolean; errors: string } - проверка первого шага (адрес + оплата)
- validateAll(): { valid: boolean; errors: string } - проверка обоих шагов: сперва validateStep1(), затем контакты.
- reset(): void - полный сброс состояния заказа (удобно вызывать после успешной отправки)
- toOrderFormState(): { payment: PaymentMethod | null; address: string; valid: boolean; errors: string } - формирует состояние для OrderForm (шаг 1). Презентер напрямую передаёт этот объект в orderForm.render(...).
- toContactsFormState(): { name?: string; email: string; phone: string; valid: boolean; errors: string } - формирует состояние для ContactsForm (шаг 2). Презентер передаёт его в contactsForm.render(...).

### Представления (Views)
Классы отображают данные внутри переданных контейнеров. Все они наследуются от Component или специализированных базовых классов.

#### Класс Page
Контейнер главной страницы: каталог, кнопка корзины, счётчик, блокировка скролла при открытии модалки.

Поля
- _counter: HTMLElement — .header__basket-counter
- _catalog: HTMLElement — .gallery
- _wrapper: HTMLElement — .page__wrapper
- _basket: HTMLElement — .header__basket

Методы
- constructor(container: HTMLElement, events: IEvents) - Вешает клик на _basket → events.emit('basket:open').
- set counter(value: number) - Обновляет число в шапке.
- set catalog(items: HTMLElement[]) - Перерисовывает каталог (replaceChildren).
- set locked(value: boolean) - Тогглит класс .page__wrapper_locked.
- render(data: { counter: number; catalog: HTMLElement[]; locked: boolean }): HTMLElement - Вызывает сеттеры и возвращает контейнер.

#### Класс Modal
Реализует модальное окно. Управляет открытием/закрытием, устанавливает слушатели на клик по фону и кнопке-крестику.

Поля:
- _closeButton: HTMLButtonElement — кнопка закрытия
- _content: HTMLElement — контейнер для содержимого

Методы:
- constructor(container: HTMLElement, events: IEventEmitter) - вызывается при создании экземпляра класса через new
- open() — открыть модалку
- close() — закрыть модалку
- set content(node: HTMLElement) — вставка содержимого
- Внутри эмитит modal:open/modal:close

#### Класс ProductCard
Карточка товара в каталоге (кликабельна — открывает предпросмотр).

Поля
- title?: HTMLElement — .card__title
- category?: HTMLElement — .card__category
- price?: HTMLElement — .card__price
- image?: HTMLImageElement — .card__image
- protected _id: string | null — внутренний id товара (устанавливается при рендере через applyBase)

Методы
- constructor(container: HTMLElement, { onPreview? }: { onPreview?: (id: string) => void }) - Сохраняет ссылки на элементы, навешивает клик на корневой элемент this.el. По клику, если _id установлен, вызывает onPreview(_id).
- render(data: IProduct): HTMLElement - Вызывает super.render(product) и применяет базовое заполнение через applyBase(product):
_id = product.id
setText(title, product.name)
setText(price, formatNumber(product.cost))
setImage(image, product.img_url, product.name)
если есть category — выставляет текст и CSS-класс категории
Возвращает this.el.

#### Класс ProductCardPreview
Карточка предпросмотра: картинка, описание, категория, цена и кнопка покупки/удаления из корзины.

Поля
- text? : HTMLElement — описание (.card__text или .card__description)
- btn? : HTMLButtonElement — кнопка добавления/удаления (.card__button или [data-role="toggle-cart"])
- protected _id: string | null — id товара
- поля как в ProductCard (title?, category?, price?, image?)

Методы
- constructor(container: HTMLElement, props: { onToggleCart: (id: string) => void }) - Вешает обработчик на кнопку: при клике, если _id задан, вызывает onToggleCart(_id).
- render(product: IProduct & { inCart?: boolean }): HTMLElement - Проставляет data-id. Oбновляет text, price, casuper.render(product) и applyBase(product) (заголовок, картинка, категория).


#### Класс Basket
Модальное представление корзины.

Поля
- _list: HTMLElement — .basket__list
- _total: HTMLElement | null — .basket__price или .basket__total
- _button: HTMLElement | null — .basket__button или .basket__action
- events: EventEmitter — брокер событий, приходит в конструктор

Методы
- constructor(container: HTMLElement, events: EventEmitter) - На кнопку _button вешает клик → events.emit('order:open').
- set items(items: HTMLElement[]) - Рендерит список; при пустом — вставляет <p>Корзина пуста</p>.
- set selected(items: string[]) - Делает кнопку неактивной, если в корзине пусто (items.length === 0).
- set total(total: number) - Выводит сумму в _total (через formatNumber).
- render(data: { items: HTMLElement[]; total: number; selected: string[] }): HTMLElemen - Вызывает перечисленные сеттеры и возвращает контейнер.

#### Класс» BasketItemView
Компонент отображает один товар в списке корзины. Наследуется от базового Component и содержит только логику, общую для всех представлений (установка текста, отключение элементов и т. п.).

Поля:
- .basket__item-index : HTMLElement — порядковый номер
- .card__title : HTMLElement — название
- .card__price : HTMLElement — цена (formatNumber)
- .basket__item-delete : HTMLElement - кнопка удаления

Методы:
- constructor(container: HTMLElement, { index, onDelete }: { index: number; onDelete: (id: string) => void }) — Находит элементы, навешивает обработчик на кнопку удаления: при клике, если _id установлен, вызывает onDelete(_id).
-  render(product: IProduct): HTMLElement — Заполняет: 
-  _id = product.id
- setText(.card__title, product.name)
- setText(.card__price, formatNumber(product.cost))
- setText(.basket__item-index, String(index))
- Возвращает this.el.


#### Класс OrderForm
Компонент не хранит данных и не валидирует их. В обработчиках событий только эмитит ORDER_ADDRESS_CHANGED и ORDER_SUBMITTED. Переключение способа оплаты, ошибки и доступность кнопки управляются исключительно через render(state), где state формируется моделью и передаётся презентером

Поля
- inputAddress: HTMLInputElement — input[name="address"]
- btnCard: HTMLButtonElement — button[name="card"]
- btnCash: HTMLButtonElement — button[name="cash"]
- submitBtn: HTMLButtonElement — .order__button
- errorsEl?: HTMLElement — .form__errors (может отсутствовать в шаблоне)events: EventEmitter — брокер событий (передаётся в конструктор)


Методы
- constructor(container: HTMLElement, events: EventEmitter) — эмитит:
  1. ORDER_ADDRESS_CHANGED — на ввод адреса / смену способа оплаты
(передаётся { address, payment? })
  2. ORDER_SUBMITTED — на submit формы
- set valid(v: boolean) — включает/выключает кнопку «Далее» (setDisabled(submitBtn, !v))
- set errors(msg: string) — показывает сообщение об ошибке в errorsEl (setText)
- render({ payment, address, valid, errors }): HTMLElement — применяет состояние: подсветка активной оплаты, актуальный адрес, блокировка кнопки, ошибки; возвращает форму.

#### Класс ContactsForm
Форма второго шага: контакты. Поддерживает опциональное поле name (может отсутствовать в шаблоне). Не содержит валидации. Эмитит изменения полей и submit. Кнопку “Оплатить” активирует по valid, ошибки берёт из errors, переданных презентером.

Поля
- inputEmail: HTMLInputElement — input[name="email"]
- inputPhone: HTMLInputElement — input[name="phone"]
- inputName?: HTMLInputElement — input[name="name"] (может отсутствовать)
- submitBtn: HTMLButtonElement — button[type="submit"]
- errorsEl?: HTMLElement — .form__errors
- events: EventEmitter

Методы
- constructor(container: HTMLElement, events: EventEmitter) — эмитит:
1. 'contacts.email:change' | 'contacts.phone:change' | 'contacts.name:change' — при вводе соответствующих полей
2. 'contacts:submit' — при отправке формы
- set valid(v: boolean) — включает/выключает кнопку «Оплатить»
- set errors(msg: string) — отображает ошибки валидации
- render({ name?, email, phone, valid, errors }): HTMLElement — заполняет значения инпутов, применяет valid/errors, возвращает форму.


#### Класс SuccessView
Экран успешного заказа.

Поля
- totalEl: HTMLElement — .order-success__description
- closeBtn: HTMLButtonElement —  order-success__close

Методы
- render({ total, onClose }: { total: number; onClose: () => void }): HTMLElement — проставляет текст суммы через formatNumber(total), навешивает клик на кнопку закрытия (вызовет onClose()); возвращает контейнер.

### Презентер
В проекте используется один презентер, код которого находится в index.ts.
Задачи:
1. Загружает товары из API (ICommerceAPI.getProducts() → IProduct[]) и кладёт в ProductModel.
2. Рендерит каталог по модели.
3. Реагирует на клики пользователя из View (добавление/удаление из корзины, ввод адреса/контактов).
4. Обновляет модели и централизованно перерисовывает View по событию модели 'order:changed' и CART_UPDATED.
5. Управляет модалками (basket, order step 1/2, success).

### API
Сервер отдаёт ApiProduct, а маппинг в IProduct делает ProductModel.
ICommerceAPI:
- getProducts(): Promise<ApiProduct[]> - Загружает список всех доступных товаров с сервера и преобразует их к внутреннему типу IProduct.
- getProductById(id: string): Promise<ApiProduct>- олучает детальную информацию по одному товару по его идентификатору.
- createOrder(order: OrderPayload): Promise<void> - Отправляет данные заказа на сервер для оформления.

Цепочка потока данных: Presenter -> api.getProducts() -> productModel.setProducts(raw) -> mapToProduct -> View.