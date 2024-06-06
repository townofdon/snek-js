import React, { act } from "react";
import cx from 'classnames';

import { Tile } from "./editorTypes";

import * as styles from "./Editor.css";

interface EditorTilesProps {
  activeTile: Tile,
  setTile: (tile: Tile) => void,
}

export const EditorTiles = ({ activeTile, setTile }: EditorTilesProps) => {
  const renderTile = (tile: Tile) => {
    const tileClassName = {
      [Tile.None]: undefined,
      [Tile.Barrier]: styles.barrier,
      [Tile.Passable]: styles.passable,
      [Tile.Door]: styles.door,
      [Tile.Deco1]: styles.deco1,
      [Tile.Deco2]: styles.deco2,
      [Tile.Apple]: styles.apple,
      [Tile.Nospawn]: styles.nospawn,
      [Tile.Lock]: styles.lock,
      [Tile.Key]: styles.key,
      [Tile.Portal]: styles.portal,
      [Tile.Spawn]: styles.spawn,
    }[tile]
    const tileLabel = {
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
      [Tile.Spawn]: 'snek spawnpoint',
    }[tile]
    const tileShortcut = {
      [Tile.None]: null,
      [Tile.Barrier]: 1,
      [Tile.Passable]: 2,
      [Tile.Door]: 3,
      [Tile.Deco1]: 4,
      [Tile.Deco2]: 5,
      [Tile.Apple]: 6,
      [Tile.Nospawn]: 7,
      [Tile.Lock]: 8,
      [Tile.Key]: 9,
      [Tile.Portal]: 0,
      [Tile.Spawn]: '~',
    }[tile]
    return (
      <div className={cx(styles.stack, styles.justifyEnd)}>
        <span className={styles.shortcut}>{tileShortcut}</span>
        <button
          className={cx(styles.editorTileSprite, tileClassName, { [styles.active]: tile === activeTile })}
          onClick={() => setTile(tile)}
        >
          {tileLabel && <span className={cx('tooltip', styles.tooltip)}>{tileLabel}</span>}
        </button>
      </div>
    )
  }
  return (
    <div className={styles.editorTiles}>
      {renderTile(Tile.Barrier)}
      {renderTile(Tile.Passable)}
      {renderTile(Tile.Door)}
      {renderTile(Tile.Deco1)}
      {renderTile(Tile.Deco2)}
      {renderTile(Tile.Apple)}
      {renderTile(Tile.Nospawn)}
      {renderTile(Tile.Lock)}
      {renderTile(Tile.Key)}
      {renderTile(Tile.Portal)}
      {renderTile(Tile.Spawn)}
    </div>
  )
}
