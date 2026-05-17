import { Tile } from "../editorTypes";

export const getTileLabel = (tile: Tile): string | null => {
  return ({
    [Tile.None]: null,
    [Tile.Barrier]: 'barrier',
    [Tile.Passable]: 'passable barrier',
    [Tile.Door]: 'door',
    [Tile.Deco1]: 'bg 1',
    [Tile.Deco2]: 'bg 2',
    [Tile.Apple]: 'start apple',
    [Tile.Nospawn]: 'no apple spawn',
    [Tile.Lock]: 'lock',
    [Tile.Key]: 'key',
    [Tile.Portal]: 'portal',
    [Tile.Spawn]: 'snek spawn',
    [Tile.Threat]: 'threat',
    [Tile.Invincibility]: 'invincibility',
    [Tile.Armor]: 'armor',
    [Tile.Reversibility]: 'reversibility',
  } satisfies Record<Tile, string>)[tile];
}

export const getTileExplanation = (tile: Tile): string => {
  return ({
    [Tile.None]: '',
    [Tile.Barrier]: 'permanent obstruction',
    [Tile.Passable]: 'becomes passable when doors open',
    [Tile.Door]: 'opens after apples eaten or time elapsed',
    [Tile.Deco1]: 'background decor',
    [Tile.Deco2]: 'background decor',
    [Tile.Apple]: 'spawns once at map start',
    [Tile.Nospawn]: 'prevent apple spawn at location',
    [Tile.Lock]: 'opens with key of same channel',
    [Tile.Key]: 'opens lock of same channel',
    [Tile.Portal]: 'warp to portal with same channel',
    [Tile.Spawn]: 'spawn snek at location on map start',
    [Tile.Threat]: 'threats that damage snekky',
    [Tile.Invincibility]: 'makes the player invincible for a short time',
    [Tile.Armor]: 'gives the player damage protection',
    [Tile.Reversibility]: 'allows player to reverse at will',
  } satisfies Record<Tile, string>)[tile];
}
