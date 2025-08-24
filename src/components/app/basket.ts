import { Component } from '../common/base/component';
import { createElement, ensureElement, formatNumber } from '../../utils/utils';
import { EventEmitter } from '../common/base/events';

interface IBasketView {
  items: HTMLElement[];
  total: number;
  selected: string[];
}

export class Basket extends Component<IBasketView> {
  protected _list: HTMLElement;
  protected _total: HTMLElement | null;
  protected _button: HTMLElement | null;

  constructor(container: HTMLElement, protected events: EventEmitter) {
    super(container);

    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._total =
      this.container.querySelector('.basket__price') ||
      this.container.querySelector('.basket__total');
    this._button =
      this.container.querySelector('.basket__button') ||
      this.container.querySelector('.basket__action');

    this._button?.addEventListener('click', () => {
      this.events.emit('order:open');
    });

    this.items = [];
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
      this._list.replaceChildren(...items);
    } else {
      this._list.replaceChildren(
        createElement<HTMLParagraphElement>('p', {
          textContent: 'Корзина пуста',
        })
      );
    }
  }

  set selected(items: string[]) {
    if (this._button) {
      this.setDisabled(this._button, items.length === 0);
    }
  }

  set total(total: number) {
    if (this._total) this.setText(this._total, formatNumber(total));
  }

  render(view: IBasketView): HTMLElement {
    super.render();

    const { items, total, selected } = view;
    this.items = items;
    this.total = total;
    this.selected = selected;

    return this.container;
  }
}
