import { EventEmitter } from '../../common/base/events'; 
import { AppEvents, PaymentMethod } from '../../../types'; 
 
type OrderFormState = { 
  payment: PaymentMethod | null; 
  address: string; 
  valid: boolean; 
  errors: string; 
}; 
 
export class OrderForm { 
  private el: HTMLFormElement; 
  private events: EventEmitter; 
 
  private inputAddress: HTMLInputElement; 
  private btnCard: HTMLButtonElement; 
  private btnCash: HTMLButtonElement; 
  private submitBtn: HTMLButtonElement; 
  private errorsEl: HTMLElement | null; 
 
 
  private currentPayment: PaymentMethod | null = null;
  constructor(container: HTMLFormElement, events: EventEmitter) { 
    this.el = container; 
    this.events = events; 
 
    this.inputAddress = this.el.querySelector('input[name="address"]')!; 
    this.btnCard = this.el.querySelector('button[name="card"]')!; 
    this.btnCash = this.el.querySelector('button[name="cash"]')!; 
    this.submitBtn = this.el.querySelector('.order__button')!; 
    this.errorsEl = this.el.querySelector('.form__errors'); 
 
    this.inputAddress.addEventListener('input', () => { 
      const address = this.inputAddress.value ?? ''; 
      this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, { 
        payment: null, 
        address, 
      } as any); 
      this.recalcAndToggle(); 
    }); 
 
    this.btnCard.addEventListener('click', (e) => { 
      e.preventDefault(); 
      this.setPaymentLocal('card');
      this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, { 
        payment: 'card', 
        address: this.inputAddress.value ?? '', 
      } as any); 
      this.recalcAndToggle(); 
    }); 
 
    this.btnCash.addEventListener('click', (e) => { 
      e.preventDefault(); 
      this.setPaymentLocal('cash'); 
      this.events.emit(AppEvents.ORDER_ADDRESS_CHANGED, { 
        payment: 'cash', 
        address: this.inputAddress.value ?? '', 
      } as any); 
      this.recalcAndToggle(); 
    }); 
 
    this.el.addEventListener('submit', (e) => { 
      e.preventDefault(); 
      this.events.emit(AppEvents.ORDER_SUBMITTED); 
    }); 
  } 
 
  set valid(v: boolean) { 
    this.submitBtn.toggleAttribute('disabled', !v); 
  } 
 
  set errors(msg: string) { 
    if (this.errorsEl) this.errorsEl.textContent = msg ?? ''; 
  } 
 
  setInitialPayment(method: PaymentMethod) { 
    this.setPaymentLocal(method); 
  } 
 
  render(state: OrderFormState) { 
    const address = state.address ?? ''; 
    if (this.inputAddress.value !== address) { 
      this.inputAddress.value = address; 
    } 
 
     
    if (state.payment !== this.currentPayment) { 
      if (state.payment) this.setPaymentLocal(state.payment); 
      else this.setPaymentLocal(null); 
    } 
 
    this.errors = state.errors ?? ''; 
    this.valid = Boolean(state.valid); 
 
    return this.el; 
  } 
 
   
  private setPaymentLocal(method: PaymentMethod | null) { 
    this.currentPayment = method; 
    this.btnCard.classList.toggle('button_alt-active', method === 'card'); 
    this.btnCash.classList.toggle('button_alt-active', method === 'cash'); 
    
    this.btnCard.setAttribute('aria-pressed', String(method === 'card')); 
    this.btnCash.setAttribute('aria-pressed', String(method === 'cash')); 
  } 
 
 
 private recalcAndToggle() {
      const hasAddress = (this.inputAddress.value ?? '').trim().length > 0; 
    const hasPayment = this.currentPayment !== null; 
    this.valid = hasAddress && hasPayment; 
  } 
} 
