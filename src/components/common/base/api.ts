export interface ApiListResponse<T> {
  items: T[];
}

export class Api {
  constructor(private baseUrl: string, private options: RequestInit = {}) {}

  async get<T = unknown>(path: string): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      ...this.options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.options.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
    return (await res.json()) as T;
  }

  async post<T = unknown, B = unknown>(path: string, body: B): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      ...this.options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.options.headers ?? {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${path} ${res.status}`);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }
}
