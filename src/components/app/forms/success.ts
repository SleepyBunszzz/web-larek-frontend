import { Component } from '../../common/base/component'; 
import { ensureElement, formatNumber } from '../../../utils/utils'; 
 
type SuccessData = { total: number; onClose: () => void }; 
 
export class SuccessView extends Component<SuccessData> { 
  private totalEl: HTMLElement; 
  private closeBtn: HTMLButtonElement; 
 
  constructor(container: HTMLElement) { 
    super(container); 
    this.totalEl = ensureElement<HTMLElement>('.order-success__description', container); 
    this.closeBtn = ensureElement<HTMLButtonElement>('.order-success__close', container); 
 
    this.closeBtn.addEventListener('click', () => { 
       this.state.onClose?.();
    }); 
  } 
 
protected onRender(): void {
    if (typeof this.state.total === 'number') {
      this.setText(this.totalEl, `Списано ${formatNumber(this.state.total)} синапсов`);
    }
  }
   render(data: SuccessData): HTMLElement {
    return super.render(data);
  }
}
