// src/components/base/events.ts

// Хорошая практика даже простые типы выносить в алиасы
// Зато когда захотите поменять это достаточно сделать в одном месте
type EventName = string | RegExp;
type Subscriber = Function;
type EmitterEvent = {
    eventName: string,
    data: unknown
};

export interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

/**
 * Брокер событий, классическая реализация
 * В расширенных вариантах есть возможность подписаться на все события
 * или слушать события по шаблону например
 */
export class EventEmitter implements IEvents {
    private _events: Map<EventName, Set<Subscriber>>;

    constructor() {
        this._events = new Map<EventName, Set<Subscriber>>();
    }

    /**
     * Установить обработчик на событие
     */
    on<T extends object>(eventName: EventName, callback: (event: T) => void): void {
        if (!this._events.has(eventName)) {
            this._events.set(eventName, new Set<Subscriber>());
        }
        this._events.get(eventName)!.add(callback as Subscriber);
    }

    /**
     * Снять обработчик с события
     */
    off(eventName: EventName, callback: Subscriber): void {
        if (!this._events.has(eventName)) return;
        const set = this._events.get(eventName)!;
        set.delete(callback);
        if (set.size === 0) {
            this._events.delete(eventName);
        }
    }

    /**
     * Инициировать событие с данными
     */
    emit<T extends object>(eventName: string, data?: T): void {
        this._events.forEach((subscribers, name) => {
            // слушатели всех событий
            if (name === '*') {
                subscribers.forEach(cb => (cb as (e: EmitterEvent) => void)({
                    eventName,
                    data
                }));
            }
            // точное совпадение имени события или совпадение по RegExp
            if ((name instanceof RegExp && name.test(eventName)) || name === eventName) {
                subscribers.forEach(cb => (cb as (d: T) => void)(data as T));
            }
        });
    }

    /**
     * Слушать все события
     */
    onAll(callback: (event: EmitterEvent) => void): void {
        // подсказка типам: это слушатель формата EmitterEvent
        this.on<EmitterEvent>('*', callback);
    }

    /**
     * Сбросить все обработчики
     */
    offAll(): void {
        // сохраняем тот же дженерик Map<EventName, ...>, а не Map<string, ...>
        this._events = new Map<EventName, Set<Subscriber>>();
    }

    /**
     * Сделать коллбек триггер, генерирующий событие при вызове
     */
    trigger<T extends object>(eventName: string, context?: Partial<T>): (data: T) => void {
        return (event: T) => {
            this.emit<T>(eventName, {
                ...(event as T),
                ...(context || {})
            } as T);
        };
    }
}
