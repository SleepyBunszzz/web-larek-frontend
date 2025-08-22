import { EventEmitter } from './events';

export class BaseModel {
  protected events = new EventEmitter();
  on = this.events.on.bind(this.events);
  off = this.events.off.bind(this.events);
  emit = this.events.emit.bind(this.events);
}

