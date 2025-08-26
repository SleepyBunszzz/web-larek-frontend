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

Нормализованные данные приложения

```
В приложении данные приводятся к виду:
interface IProduct {
  id: string;
  name: string;
  cost: number;     // из ApiProduct.price
  desc: string;     // из ApiProduct.description
  img_url: string;  // из ApiProduct.image (через CDN при необходимости)
  category: string; // из ApiProduct.category
}
```
Payload заказа

```
export type OrderPayload = {
  payment: 'card' | 'cash';
  address: string;
  email: string;
  phone: string;
  items: string[]; // массив id товаров
  total: number;
}
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- Представления(View) - слой представления, отвечает за отображение данных на странице;
- Модели(Model) - слой данных, отвечает за хранение и изменение данных;
- Презентор(Presenter) - слой, отвечающий за связь представления и данных.


### Базовые классы

#### Класс Api
Содержит в себе базовую логику отправки запроса. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы:
- `get` - выполняет GET запрос на переданный в параметрах эндпоинт и возвращает промис с объектом, которым ответил сервер.
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на эндпоинт, переданный, как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.
Пример: загрузка товаров, оформление заказа.

#### Класс EventEmitter
Брокер событий позволяет отправить события и подписаться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом `IEventEmitter`:
- `on` - подписка на событие;
- `emit` - инициализация события;
- `off(event, callback)` — отписка от события.
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие.

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
Хранит данные для оформления заказа и проверяет их корректность.
Поля:
- payment: 'card' | 'cash' | null — способ оплаты
- address: string - адрес доставки
- email: string - электронная почта покупателя
- phone: string - номер телефона для связи.

Методы:
- setPayment(method: 'card' | 'cash'): void— сохранить выбранный способ оплаты
- setAddress(value: string): void — сохранить адрес доставки
- setEmail(value: string): void — сохранить электронную почту
- setPhone(value: string): void — сохранить телефон
- validate(): boolean — проверяет, что выбран способ оплаты, адрес и контакты (e-mail/телефон).

### API слой

#### Интерфейс ICommerceAPI
Расширяет IApiClient

Методы:
- getProducts() — получает список всех товаров
- getProductById(id) — получает один товар по ID
- createOrder(order) — оформить заказ.

### Представления (Views)
Классы отображают данные внутри переданных контейнеров. Все они наследуются от Component или специализированных базовых классов.

#### Класс Component
Базовый класс Component предоставляет единый цикл рендера:

- render(data?: unknown): HTMLElement — вызывается презентером, сохраняет данные и вызывает update(data), после чего возвращает корневой элемент компонента.
- protected update(data?: unknown): void — абстрактный метод, который реализуют потомки.

Вспомогательные методы:
- setText(node, text) — текст в элементe
- setImage(node, src, alt?) — картинка (src, alt) у <img>
- setDisabled(el, state) — включить/выключить кнопку

#### Класс Modal
Реализует модальное окно. Управляет открытием/закрытием, устанавливает слушатели на клик по фону и кнопке-крестику.

Поля:
- _closeButton: HTMLButtonElement — кнопка закрытия
- _content: HTMLElement — контейнер для содержимого
- events: IEventEmitter — брокер событий

Методы:
- open() — открыть модалку
- close() — закрыть модалку
- content = element — вставить содержимое

#### Класс ProductCard
Карточка товара в каталоге (кликабельна — открывает предпросмотр).

Поля
- title?: HTMLElement — .card__title
- category?: HTMLElement — .card__category
- price?: HTMLElement — .card__price
- image?: HTMLImageElement — .card__image
- props?: { onPreview?: (id: string) => void } — колбэк на открытие превью

Методы
- constructor(container: HTMLElement, props?: { onPreview?: (id: string) => void })
- Вешает обработчик клика на всю карточку. По клику берёт this.el.dataset.id и вызывает props.onPreview(id).
- render(data: IProduct): HTMLElement
- Проставляет data-id.
- Устанавливает текст/картинку: title, category, price, image.
- Возвращает контейнер.

#### Класс ProductCardPreview
Карточка предпросмотра: картинка, описание, категория, цена и кнопка покупки/удаления из корзины.

Поля
- title?: HTMLElement — .card__title
- text?: HTMLElement — .card__text, .card__description
- price?: HTMLElement — .card__price
- image?: HTMLImageElement — .card__image
- category?: HTMLElement — .card__category
- btn?: HTMLButtonElement — .card__button или [data-role="toggle-cart"]
- props: { onToggleCart: (id: string) => void } — колбэк на добавление/удаление из корзины

Методы
- constructor(container: HTMLElement, props: { onToggleCart: (id: string) => void }) - Вешает обработчик на кнопку: читает this.el.dataset.id и вызывает onToggleCart(id).
- render(data: IProduct & { inCart?: boolean }): HTMLElement - Проставляет data-id. Oбновляет title, text, price, category, image. Изменяет текст кнопки:если inCart === true → «Убрать из корзины» иначе → «Купить»
- Возвращает контейнер.

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

Заполняет:
- .basket__item-index — порядковый номер
- .card__title — название
- .card__price — цена (formatNumber)
- .basket__item-delete, .card__button - кнопка удаления

Методы:
- constructor(container: HTMLElement, props: BasketItemProps) — сохраняет ссылки на элементы и вешает обработчик удаления. Идентификатор товара берётся из data-id корневого узла.
-  render(product: IProduct): HTMLElement — вызывает super.render(product) и возвращает корневой элемент
-  protected update(data?: unknown): void — применяет данные к DOM
-  
#### Класс Page
Контейнер главной страницы: каталог, кнопка корзины, счётчик, блокировка скролла при открытии модалки.

Поля
- _counter: HTMLElement — .header__basket-counter
- _catalog: HTMLElement — .gallery
- _wrapper: HTMLElement — .page__wrapper
- _basket: HTMLElement — .header__basket
- events: IEvents

Методы
- constructor(container: HTMLElement, events: IEvents) - Вешает клик на _basket → events.emit('basket:open').
- set counter(value: number) - Обновляет число в шапке.
- set catalog(items: HTMLElement[]) - Перерисовывает каталог (replaceChildren).
- set locked(value: boolean) - Тогглит класс .page__wrapper_locked.
- render(data: { counter: number; catalog: HTMLElement[]; locked: boolean }): HTMLElement - Вызывает сеттеры и возвращает контейнер.

#### Класс OrderForm
Компонент не хранит данных и не валидирует их. В обработчиках событий только эмитит ORDER_ADDRESS_CHANGED и ORDER_SUBMITTED. Переключение способа оплаты, ошибки и доступность кнопки управляются исключительно через render(state), где state формируется моделью и передаётся презентером

Поля
- el: HTMLFormElement
- events: EventEmitter
- inputAddress: HTMLInputElement — input[name="address"]
- btnCard: HTMLButtonElement — button[name="card"]
- btnCash: HTMLButtonElement — button[name="cash"]
- submitBtn: HTMLButtonElement — .order__button
- errorsEl: HTMLElement | null — .form__errors
  
Методы
- constructor(container: HTMLFormElement, events: EventEmitter) - Слушает:
ввод адреса → emitAddressChanged() + validateAndToggle()
клик «Онлайн» → setPayment('card') → emitAddressChanged() → validateAndToggle()
клик «При получении» → setPayment('cash') → emitAddressChanged() → validateAndToggle()
submit → validateAndToggle() → events.emit(AppEvents.ORDER_SUBMITTED)
- setInitialPayment(method: PaymentMethod): void - Выставляет оплату по умолчанию (подсветка кнопки), эмитит событие и запускает валидацию.
- set valid(v: boolean) - Активирует/деактивирует «Далее».
- set errors(msg: string) - Пишет текст ошибки (или очищает).
- render(opts: { valid: boolean; errors: string }): HTMLElement - Применяет состояние и возвращает форму.

#### Класс ContactsForm
Форма второго шага: контакты. Поддерживает опциональное поле name (может отсутствовать в шаблоне). Не содержит валидации. Эмитит изменения полей и submit. Кнопку “Оплатить” активирует по valid, ошибки берёт из errors, переданных презентером.

Поля
- el: HTMLFormElement
- events: EventEmitter
- inputEmail: HTMLInputElement — input[name="email"]
- inputPhone: HTMLInputElement — input[name="phone"]
- inputName: HTMLInputElement | null — input[name="name"] (может быть null)
- submitBtn: HTMLButtonElement — button[type="submit"]
- errorsEl: HTMLElement | null — .form__errors

Методы
- constructor(container: HTMLFormElement, events: EventEmitter) - слушает изменения полей и отправку формы
- set valid(v: boolean) - активирует/деактивирует «Оплатить».
- set errors(msg: string) - отображает ошибки валидации.
- render(opts: { valid: boolean; errors: string }): HTMLElement - применяет состояние.


#### Класс SuccessView
Экран успешного заказа.

Поля
- totalEl: HTMLElement — .order-success__description
- closeBtn: HTMLButtonElement — .order-success__close

Методы
- constructor(container: HTMLElement) - Находит элементы, не вешает свои события (колбэк приходит в render).
- render(data: { total: number; onClose: () => void }): HTMLElement - Пишет сумму: Списано {total} (через formatNumber).
- Вешает клик на кнопку закрытия (once: true) → вызывает onClose().
- Возвращает контейнер.

### Презентер
В проекте используется один презентер, код которого находится в index.ts.
Задачи:
1. Подписывается на события от View
2. Обновляет модели
3. Управляет отображением модальных окон
4. Загружает данные через API
5. Обновляет View при изменениях в моделях

Основной поток:
- Загрузка товаров → ProductModel → обновление каталога.
- Добавление в корзину → CartModel → обновление корзины.
- Оформление заказа → проверка в OrderModel.validate() → отправка через ICommerceAPI.