import React from "react";
import cx from 'classnames';

import { EditorTool } from "./editorSketch";

import * as styles from "./Editor.css";

interface EditorToolsProps {
  activeTool: EditorTool,
  setTool: (tool: EditorTool) => void,
}

export const EditorTools = ({ activeTool, setTool }: EditorToolsProps) => {
  const renderTool = (tool: EditorTool) => {
    const toolClassName = {
      [EditorTool.Bucket]: styles.bucket,
      [EditorTool.Pencil]: styles.pencil,
      [EditorTool.Eraser]: styles.eraser,
      [EditorTool.Line]: styles.line,
      [EditorTool.Rectangle]: styles.rectangle,
    }[tool]
    return (
      <button
        className={cx(styles.editorToolSprite, toolClassName, { [styles.active]: tool === activeTool })}
        onClick={() => setTool(tool)}
      />
    )
  }
  return (
    <div className={styles.editorTools}>
      <h1 className={styles.editorTitle}>SNEK<br/>EDITOR</h1>
      <div className={styles.editorToolsOffset}>
        {renderTool(EditorTool.Pencil)}
        {renderTool(EditorTool.Eraser)}
        {renderTool(EditorTool.Line)}
        {renderTool(EditorTool.Rectangle)}
        {/* <button className={cx(styles.editorToolSprite, styles.pencil, styles.active)} />
        <button className={cx(styles.editorToolSprite, styles.eraser)} />
        <button className={cx(styles.editorToolSprite, styles.line)} />
        <button className={cx(styles.editorToolSprite, styles.rectangle)} /> */}
      </div>
    </div>
  )
}