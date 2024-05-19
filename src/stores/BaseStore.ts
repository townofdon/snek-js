
export abstract class BaseStore<T> {
  public abstract get key(): string;

  protected clearStore = () => {
    this.validate();
    localStorage.removeItem(this.key);
  }

  protected getStore = (): (T | null) => {
    this.validate();
    try {
      return JSON.parse(localStorage.getItem(this.key)) as T
    } catch (err) {
      console.warn(err);
      return null;
    }
  }

  protected setStore = (value: T) => {
    this.validate();
    try {
      localStorage.setItem(this.key, JSON.stringify(value))
    } catch (err) {
      console.warn(err);
    }
  }

  private validate = () => {
    if (!this.key) throw new Error('local storage key is required');
  }
}
