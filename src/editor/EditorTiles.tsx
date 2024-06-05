import React from "react";
import cx from 'classnames';

import * as styles from "./Editor.css";

export const EditorTiles = () => {
  return (
    <div className={styles.editorTiles}>
      <button className={cx(styles.editorTileSprite, styles.barrier, styles.active)} />
      <button className={cx(styles.editorTileSprite, styles.passable)} />
      <button className={cx(styles.editorTileSprite, styles.door)} />
      <button className={cx(styles.editorTileSprite, styles.deco1)} />
      <button className={cx(styles.editorTileSprite, styles.deco2)} />
      <button className={cx(styles.editorTileSprite, styles.apple)} />
      <button className={cx(styles.editorTileSprite, styles.nospawn)} />
      <button className={cx(styles.editorTileSprite, styles.lock)} />
      <button className={cx(styles.editorTileSprite, styles.key)} />
      <button className={cx(styles.editorTileSprite, styles.portal)} />
      <button className={cx(styles.editorTileSprite, styles.spawn)} />
    </div>
  )
}
