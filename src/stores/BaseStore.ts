export enum StoreDatatype {
  Json,
  String,
}

export abstract class BaseStore<T> {
  protected abstract get key(): string;
  protected get datatype() { return StoreDatatype.Json; }

  protected clearStore = () => {
    this.validate();
    localStorage.removeItem(this.key);
  }

  protected getStore = (): (T | null) => {
    this.validate();
    try {
      const itemRaw = localStorage.getItem(this.key);
      if (this.datatype === StoreDatatype.String) {
        return itemRaw as T;
      }
      if (!itemRaw) return null;
      return JSON.parse(itemRaw) as T
    } catch (err) {
      console.warn(err);
      return null;
    }
  }

  protected setStore = (value: T) => {
    this.validate();
    try {
      if (this.datatype === StoreDatatype.String && typeof value === 'string') {
        localStorage.setItem(this.key, value)
      } else {
        localStorage.setItem(this.key, JSON.stringify(value))
      }
    } catch (err) {
      console.warn(err);
    }
  }

  private validate = () => {
    if (!this.key) throw new Error('local storage key is required');
  }
}
