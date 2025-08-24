export abstract class Component<TData = unknown> {
  protected readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(_data?: TData): HTMLElement {
    return this.container;
  }

  protected setText(el: Element | null | undefined, text?: string | number) {
    if (el && typeof text !== 'undefined' && el instanceof HTMLElement) {
      el.textContent = String(text);
    }
  }

  protected setImage(el: Element | null | undefined, src?: string, alt?: string) {
    if (el instanceof HTMLImageElement && src) {
      el.src = src;
      if (typeof alt !== 'undefined') el.alt = alt;
    }
  }

  protected setDisabled(el: Element | null | undefined, disabled = true) {
    if (!el) return;
    const htmlEl = el as HTMLElement & { disabled?: boolean };
    if ('disabled' in htmlEl) htmlEl.disabled = disabled;
    htmlEl.classList.toggle('is-disabled', disabled);
  }

  get el(): HTMLElement {
    return this.container;
  }
}


