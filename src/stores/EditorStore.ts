import { EditorStoreData } from "../types";
import { BaseStore } from "./BaseStore";

class EditorStore extends BaseStore<EditorStoreData> {
  public get key(): string {
    return "editor-data"
  }

  private readonly defaultValue: EditorStoreData = {
    author: '',
  };

  private state: EditorStoreData = {
    ...this.defaultValue,
    ...this.getStore(),
  };

  public getAuthor = () => this.state.author;

  public setAuthor = (val: string) => {
    this.state.author = val;
    this.setStore(this.state);
  }

  public reset = () => {
    this.clearStore();
    this.state = { ...this.defaultValue };
  }
}

export const editorStore = new EditorStore();
