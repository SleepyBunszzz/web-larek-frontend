export abstract class Component<TState = unknown> {
  protected readonly el: HTMLElement;
  protected state: Partial<TState> = {};

  constructor(container: HTMLElement) {
    this.el = container;
  }

  public get container(): HTMLElement {
    return this.el;
  }

  protected setText(el: Element | null, value?: string | number) {
    if (el) el.textContent = String(value ?? '');
  }

  protected setImage(img: HTMLImageElement | null, src?: string, alt?: string) {
    if (img && src) {
      img.src = src;
      if (alt !== undefined) img.alt = alt;
    }
  }

  protected setDisabled(el: Element | null, state: boolean) {
if (!el) return;
    if (el instanceof HTMLButtonElement) {
      el.disabled = state;
    } else {
       el.toggleAttribute('disabled', state);
  }
}

  protected toggleClass(el: Element | null, className: string, force?: boolean) {
    if (!el) return;
    el.classList.toggle(className, force);
  }

  protected setHidden(el: Element | null) {
    if (el) el.classList.add('hidden');
  }

  protected setVisible(el: Element | null) {
    if (el) el.classList.remove('hidden');
  }
  render(next?: Partial<TState>): HTMLElement {
    if (next) {
      this.state = { ...this.state, ...next };
    }
    this.onRender();
    return this.el;
  }
  protected onRender(): void {
  }
}



