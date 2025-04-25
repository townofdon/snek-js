import { v4 as uuid } from 'uuid';

import { BaseStore, StoreDatatype } from "./BaseStore";

class IdentityStore extends BaseStore<string> {
  public get key(): string { return "identity"; }
  protected override get datatype() { return StoreDatatype.String; }

  private newId = () => {
    this.id = uuid();
    this.setStore(this.id);
    return this.id;
  }

  private id: string = this.getStore() || this.newId();

  public getId = () => this.id;

  public reset = () => {
    this.newId();
  }
}

export const identityStore = new IdentityStore();
