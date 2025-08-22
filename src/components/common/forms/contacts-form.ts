// src/components/common/forms/contacts-form.ts
import { Form } from '../form';
import type { IEvents } from '../../base/events';
import { ensureElement } from '../../../utils/utils';

type ContactsFields = { name: string; email: string; phone: string };

export class ContactsForm extends Form<ContactsFields> {
  private nameInput: HTMLInputElement;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    // указываем ожидаемые типы элементов явно
    this.nameInput  = ensureElement<HTMLInputElement>('input[name="name"]', container);
    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);
  }

  reset() {
    this.nameInput.value = '';
    this.emailInput.value = '';
    this.phoneInput.value = '';
  }
}
