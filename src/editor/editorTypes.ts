import P5 from "p5";
import { DIR, EditorData, MapAnnotation, PipeConnection } from "@/types";

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
  Annotation,
}

// TODO: REMOVE
// export interface EditorMapMetadata {
//   annotations: Record<number, MapAnnotation>,
//   pipeOverrides: Record<number, PipeConnection>,
//   tileDirectionOverrides: Record<number, TileDirectionOverride>,
// }

// TODO: REMOVE
// export interface EditorMapMetadataSlice {
//   coord: number,
//   annotation: MapAnnotation,
//   tileDirectionOverride: TileDirectionOverride,
// }

export interface EditorMapExtendedData {
    annotations: Record<number, MapAnnotation>,
    pipeOverrides: Record<number, PipeConnection>,
}

export interface MapSaveData {
  mapId: string,
  name: string,
  author: string,
  mapData: string,
  annotations: Record<number, MapAnnotation>,
  pipeOverrides: Record<number, PipeConnection>,
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

export const validEditorData = (data: any): data is EditorData => {
  if (typeof data !== 'object') return false;
  const invalidFields = [];
  const sampleEditorData = {
        applesMap: {},
        threatsMap: {},
        pickupsMap: {},
        barriersMap: {},
        decoratives1Map: {},
        decoratives2Map: {},
        doorsMap: {},
        keysMap: {},
        locksMap: {},
        nospawnsMap: {},
        passablesMap: {},
        portalsMap: {},
        switchesMap: {},
        pipesMap: {},
        annotations: {},
        pipeOverrides: {},
        playerSpawnPosition: new P5.Vector(15, 15),
        startDirection: DIR.RIGHT,
  } satisfies EditorData;
  Object.keys(sampleEditorData).forEach(key => {
    if (typeof data[key] !== typeof sampleEditorData[key]) {
      invalidFields.push(key);
    }
  });
  invalidFields.forEach(key => {
    console.error(`invalid EditorData field "${key}"`);
  })
  if (invalidFields.length) {
    return false;
  }
  return true;
}
