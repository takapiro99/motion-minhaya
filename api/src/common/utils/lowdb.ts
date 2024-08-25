export interface Adapter<T> {
  read: () => T | null;
  write: (data: T) => void;
}

export class MemorySync<T> {
  #data: T | null = null;
  read() {
    return this.#data || null;
  }
  write(obj: T): void {
    this.#data = obj;
  }
}

function checkArgs<T>(adapter: Adapter<T>, defaultData: T) {
  if (adapter === undefined) throw new Error("lowdb: missing adapter");
  if (defaultData === undefined) throw new Error("lowdb: missing default data");
}

export class LowSync<T> {
  adapter: Adapter<T>;
  data: T;
  constructor(adapter: Adapter<T>, defaultData: T) {
    checkArgs(adapter, defaultData);
    this.adapter = adapter;
    this.data = defaultData;
  }
  read(): void {
    const data = this.adapter.read();
    if (data) this.data = data;
  }
  write(): void {
    if (this.data) this.adapter.write(this.data);
  }
  update(fn: (data: T) => unknown): void {
    fn(this.data);
    this.write();
  }
}
