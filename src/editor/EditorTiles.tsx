import React, { act } from "react";
import cx from 'classnames';

import * as styles from "./Editor.css";
import { Tile } from "./editorTypes";

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
    return (
      <button
        className={cx(styles.editorTileSprite, tileClassName, { [styles.active]: tile === activeTile })}
        onClick={() => setTile(tile)}
      />
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
