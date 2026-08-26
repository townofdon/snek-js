
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

// note: do not change enum order.
enum MapAnnotation {
  None = 0,
  LinkLevel1,
  LinkLevel2,
  LinkLevel3,
  LinkLevel4,
  BossWeakPoint,
}

export interface MapSaveData {
  mapId: string,
  name: string,
  author: string,
  mapData: string,
  annotations: Record<number, MapAnnotation>,
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
