import { EventEmitter } from '../../common/base/events';
import { ensureElement } from '../../../utils/utils';

export type ContactsFormState = {
  name?: string;
  email?: string;
  phone?: string;
  valid: boolean;
  errors: string;
  showErrors?: boolean;
};

export class ContactsForm {
  private el: HTMLFormElement;
  private events: EventEmitter;

  private inputEmail: HTMLInputElement;
  private inputPhone: HTMLInputElement;
  private inputName: HTMLInputElement | null;

  private submitBtn: HTMLButtonElement;
  private errorsEl: HTMLElement | null;

  constructor(container: HTMLFormElement, events: EventEmitter) {
    this.el = container;
    this.events = events;

    this.inputEmail = ensureElement<HTMLInputElement>('input[name="email"]', this.el);
    this.inputPhone = ensureElement<HTMLInputElement>('input[name="phone"]', this.el);
    this.submitBtn  = ensureElement<HTMLButtonElement>('button[type="submit"]', this.el);
    this.inputName = this.el.querySelector<HTMLInputElement>('input[name="name"]');
    this.errorsEl  = this.el.querySelector<HTMLElement>('.form__errors');
    
    this.inputEmail.addEventListener('input', () => {
      this.events.emit('contacts.email:change', { field: 'email', value: this.inputEmail.value });
    });

    this.inputPhone.addEventListener('input', () => {
      this.events.emit('contacts.phone:change', { field: 'phone', value: this.inputPhone.value });
    });

    this.inputName?.addEventListener('input', () => {
      this.events.emit('contacts.name:change', { field: 'name', value: this.inputName!.value });
    });

    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit('contacts:submit');
    });
  }


  set valid(v: boolean) {
    this.submitBtn.toggleAttribute('disabled', !v);
  }

  set errors(msg: string) {
    if (this.errorsEl) this.errorsEl.textContent = msg ?? '';
  }

  render(state: ContactsFormState) {
    if (this.inputName && typeof state.name === 'string' && this.inputName.value !== state.name) {
      this.inputName.value = state.name;
    }
    if (typeof state.email === 'string' && this.inputEmail.value !== state.email) {
      this.inputEmail.value = state.email;
    }
    if (typeof state.phone === 'string' && this.inputPhone.value !== state.phone) {
      this.inputPhone.value = state.phone;
    }

    this.valid  = !!state.valid;
    const shouldShowErrors = state.showErrors === true;
    this.errors = shouldShowErrors ? (state.errors ?? '') : '';


    return this.el;
  }
}
