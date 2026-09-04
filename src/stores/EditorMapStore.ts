import { EditorMapExtendedData } from "@/editor/editorTypes";
import { BaseStore } from "./BaseStore";
import { EDITOR_DEFAULTS } from "@/editor/editorConstants";
import { pruneMap } from "@/editor/utils/saveUtils";

class EditorMapMetadataStore extends BaseStore<EditorMapExtendedData> {
  private _mapId: string;

  public get key(): string {
    return `editor-map-${this._mapId}`;
  }

  public get = (mapId: string) => {
    if (!mapId) throw new Error('[EditorMapMetadataStore] mapId required!');
    this._mapId = mapId;
    const raw = this.getStore();
    const extendedData = {
      annotations: pruneMap(raw.annotations),
      pipeOverrides: pruneMap(raw.pipeOverrides),
    } satisfies EditorMapExtendedData;
    return { ...extendedData };
  }

  public set = (mapId: string, incoming: EditorMapExtendedData) => {
    if (!mapId) throw new Error('[EditorMapMetadataStore] mapId required!');
    this._mapId = mapId;
    const extendedData = {
      annotations: pruneMap({ ...incoming.annotations }),
      pipeOverrides: pruneMap({ ...incoming.pipeOverrides }),
    } satisfies EditorMapExtendedData;
    this.setStore(extendedData);
  }

  public reset = () => {
    this.clearStore();
  }
}

export const editorMapMetadataStore = new EditorMapMetadataStore();
