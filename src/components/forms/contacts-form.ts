import { Form } from './form';
import { ensureElement } from '../../utils/utils';

type ContactsData = { name: string; email: string; phone: string };
type Handlers = {
  onChange: (data: ContactsData) => void;
  onSubmit: () => void;
};

export class ContactsForm extends Form<ContactsData> {
  private nameInput: HTMLInputElement;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;

  private state: ContactsData = { name: '', email: '', phone: '' };

  constructor(container: HTMLElement, private handlers: Handlers) {
    super(container);
    this.nameInput = document.createElement('input'); // если поля имени нет в вёрстке — создаём
    this.nameInput.type = 'hidden';
    container.append(this.nameInput);

    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);

    const onChange = () => {
      this.state = {
        name: this.nameInput.value.trim(),     // у нас имя хранится в модели, поле может быть скрытым
        email: this.emailInput.value.trim(),
        phone: this.phoneInput.value.trim(),
      };
      this.handlers.onChange(this.state);
      this.updateSubmitState();
    };

    this.emailInput.addEventListener('input', onChange);
    this.phoneInput.addEventListener('input', onChange);

    container.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlers.onSubmit();
    });

    this.updateSubmitState();
  }

  reset() {
    this.nameInput.value = '';
    this.emailInput.value = '';
    this.phoneInput.value = '';
    this.updateSubmitState();
    this.setError('');
  }

  private updateSubmitState() {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.emailInput.value.trim());
    const phoneOk = this.phoneInput.value.replace(/[^\d]/g, '').length >= 10;
    const ok = emailOk && phoneOk;
    this.setDisabled(this.submitBtn, !ok);
  }

  protected onInputChange() {}
}
