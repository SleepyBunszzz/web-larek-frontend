import { EventEmitter } from '../../common/base/events';
import { ensureElement } from '../../../utils/utils';
import { BaseForm } from '../../common/base-form';
import type { ContactsFormState as ContactsStateBase } from '../../../types';

type ContactsFormViewState = ContactsStateBase & { showErrors?: boolean };

export class ContactsForm extends BaseForm {
  private inputEmail: HTMLInputElement;
  private inputPhone: HTMLInputElement;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    super(container, events);

    this.inputEmail = ensureElement<HTMLInputElement>('input[name="email"]', this.el);
    this.inputPhone = ensureElement<HTMLInputElement>('input[name="phone"]', this.el);

    // email
    this.inputEmail.addEventListener('input', () => {
      this.events.emit('contacts.email:change', { field: 'email', value: this.inputEmail.value });
    });
    this.inputEmail.addEventListener('blur', () => {
      this.events.emit('contacts.field:blur', { field: 'email' });
    });

    // phone
    this.inputPhone.addEventListener('input', () => {
      this.events.emit('contacts.phone:change', { field: 'phone', value: this.inputPhone.value });
    });
    this.inputPhone.addEventListener('blur', () => {
      this.events.emit('contacts.field:blur', { field: 'phone' });
    });

    // submit
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit('contacts:submit');
    });
  }

  render(state: ContactsFormViewState) {
    if (typeof state.email === 'string' && this.inputEmail.value !== state.email) {
      this.inputEmail.value = state.email;
    }
    if (typeof state.phone === 'string' && this.inputPhone.value !== state.phone) {
      this.inputPhone.value = state.phone;
    }

    this.valid = !!state.valid;
    const shouldShowErrors = state.showErrors === true;
    this.errors = shouldShowErrors ? (state.errors ?? '') : '';

    return this.el;
  }
}
