import { MapAnnotation, TileDirectionOverride } from "@/types";

export type SetStateValue<T> = T | ((prev: T) => T)

export enum Tile {
  None,
  Barrier,
  Door,
  Deco1,
  Deco2,
  Apple,
  Portal,
  Key,
  Lock,
  Spawn,
  Nospawn,
  Passable,
  Threat,
  Invincibility,
  Reversibility,
  Armor,
  Switch,
  Pipe,
}

export interface EditorMetadata {
  mapId: string,
  annotations: Record<number, MapAnnotation>,
  tileDirectionOverrides: Record<number, TileDirectionOverride>,
}

export interface MapSaveData {
  mapId: string,
  name: string,
  author: string,
  mapData: string,
  annotations: Record<number, MapAnnotation>,
  tileDirectionOverrides: Record<number, TileDirectionOverride>,
  overlayImagePath: string | null,
}

export const validMapSaveData = (data: any): data is MapSaveData => {
  if (typeof data !== 'object') return false;
  const hasStringProperty = (prop: string) => data[prop] && typeof data[prop] === 'string';
  const hasOptionalStringProperty = (prop: string) => typeof data[prop] === 'string' || data[prop] === undefined || data[prop] === null;
  return [
    hasStringProperty('mapId'),
    hasStringProperty('name'),
    hasStringProperty('author'),
    typeof data.annotations === 'object' && Object.keys(data.annotations).every(key => {
      return Number.isInteger(Number(key)) && Number.isInteger(Number(data.annotations[key]));
    }),
    hasOptionalStringProperty('overlayImagePath'),
  ].every(v => !!v);
}
