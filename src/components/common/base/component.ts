export abstract class Component<TState = unknown> {
  protected readonly el: HTMLElement;
  protected state: Partial<TState> = {};

  constructor(container: HTMLElement) {
    this.el = container;
  }
  public get container(): HTMLElement {
    return this.el;
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

  protected setText(el: Element | null, value?: string | number) {
    if (!el) return;
    (el as HTMLElement).textContent = String(value ?? '');
  }

  protected setImage(img: HTMLImageElement | null, src?: string, alt?: string) {
    if (!img || !src) return;
    img.src = src;
    if (alt !== undefined) img.alt = alt;
  }

  protected setDisabled(el: Element | null, disabled: boolean) {
    if (!el) return;
    if (el instanceof HTMLButtonElement) {
      el.disabled = disabled;
    } else {
      (el as HTMLElement).toggleAttribute?.('disabled', disabled);
    }
    (el as HTMLElement).classList.toggle('is-disabled', disabled);
  }

  protected toggleClass(el: Element | null, className: string, force?: boolean) {
    if (!el) return;
    el.classList.toggle(className, force);
  }

  protected setHidden(el: Element | null) {
    el?.classList.add('hidden');
  }

  protected setVisible(el: Element | null) {
    el?.classList.remove('hidden');
  }
}
