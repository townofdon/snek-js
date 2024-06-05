import React from "react";
import cx from 'classnames';

import * as styles from "./Editor.css";


export const EditorTools = () => {
  return (
    <div className={styles.editorTools}>
      <button className={cx(styles.editorToolSprite, styles.pencil, styles.active)} />
      <button className={cx(styles.editorToolSprite, styles.eraser)} />
      <button className={cx(styles.editorToolSprite, styles.line)} />
      <button className={cx(styles.editorToolSprite, styles.rectangle)} />
    </div>
  )
}