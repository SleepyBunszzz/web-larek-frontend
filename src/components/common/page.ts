import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

interface IPageState {
  counter: number;
  catalog: HTMLElement[];
  locked: boolean;
}

export class Page extends Component<IPageState> {
  protected _counter: HTMLElement;
  protected _catalog: HTMLElement;
  protected _wrapper: HTMLElement;
  protected _basket: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._counter = ensureElement<HTMLElement>('.header__basket-counter', container);
    // в твоём pages/index.html каталог — это <main class="gallery">
    this._catalog = ensureElement<HTMLElement>('.gallery', container);
    this._wrapper = ensureElement<HTMLElement>('.page__wrapper', document.body);
    this._basket = ensureElement<HTMLElement>('.header__basket', container);

    this._basket.addEventListener('click', () => {
      this.events.emit('basket:open');
    });
  }

  set counter(value: number) {
    this.setText(this._counter, String(value));
  }

  set catalog(items: HTMLElement[]) {
    this._catalog.replaceChildren(...items);
  }

  set locked(value: boolean) {
    this._wrapper.classList.toggle('page__wrapper_locked', value);
  }

  render(data: IPageState): HTMLElement {
    super.render(data);
    this.counter = data.counter;
    this.catalog = data.catalog;
    this.locked = data.locked;
    return this.el;
  }
}
