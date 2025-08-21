export abstract class Component<T = unknown> {
  protected readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  toggleClass(el: Element, className: string, force?: boolean) {
    if (typeof force === 'boolean') el.classList.toggle(className, force);
    else el.classList.toggle(className);
  }

  setText(el: Element, value: string | number | null | undefined) {
    const text = value == null ? '' : String(value); // <-- важно: приводим к string
    (el as HTMLElement).textContent = text;
  }

  setDisabled(el: Element, disabled = true) {
    (el as HTMLButtonElement).disabled = disabled;
  }

  setHidden(el: Element) {
    (el as HTMLElement).style.display = 'none';
  }

  setVisible(el: Element) {
    (el as HTMLElement).style.removeProperty('display');
  }

  setImage(img: HTMLImageElement, src: string, alt?: string) {
    img.src = src;
    if (alt !== undefined) img.alt = alt;
  }

  render(data?: T): HTMLElement {
    if (data !== undefined) this.update(data);
    return this.container;
  }

  // Переопределяется наследниками
  protected update(_data: T): void {}
}

