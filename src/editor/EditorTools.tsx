import React from "react";
import cx from 'classnames';
import toast from "react-hot-toast";

import { EditorTool } from "./editorSketch";
import { ClearAllCommand, Command } from "./commands";
import { EditorData } from "../types";

import * as styles from "./Editor.css";

interface EditorToolsProps {
  data: EditorData,
  activeTool: EditorTool,
  hasUndo: boolean,
  hasRedo: boolean,
  setTool: (tool: EditorTool) => void,
  setData: (data: EditorData) => void,
  executeCommand: (command: Command) => void,
  undo: () => void,
  redo: () => void,
}

export const EditorTools = ({
  data,
  activeTool,
  hasUndo,
  hasRedo,
  setTool,
  setData,
  executeCommand,
  undo,
  redo,
}: EditorToolsProps) => {
  const handleSetTool = (tool: EditorTool) => {
    if (tool === EditorTool.Bomb) {
      const command = new ClearAllCommand(data, setData);
      executeCommand(command);
      toast(`Map Cleared`, {
        icon: "✓",
        duration: 2500,
        position: "bottom-right",
        className: styles.toastRedo,
      });
    } else if (tool === EditorTool.Undo) {
      undo();
    } else if (tool === EditorTool.Redo) {
      redo();
    } else {
      setTool(tool);
    }
  };
  const renderTool = (tool: EditorTool) => {
    const toolClassName = {
      [EditorTool.Bucket]: styles.bucket,
      [EditorTool.Pencil]: styles.pencil,
      [EditorTool.Eraser]: styles.eraser,
      [EditorTool.Line]: styles.line,
      [EditorTool.Rectangle]: styles.rectangle,
      [EditorTool.Bomb]: styles.bomb,
      [EditorTool.Undo]: styles.undo,
      [EditorTool.Redo]: styles.redo,
    }[tool];
    const toolLabel = {
      [EditorTool.Bucket]: "Fill",
      [EditorTool.Pencil]: "Brush",
      [EditorTool.Eraser]: "Eraser",
      [EditorTool.Line]: "Line",
      [EditorTool.Rectangle]: "Rectangle",
      [EditorTool.Bomb]: "Clear Map",
      [EditorTool.Undo]: "Undo [CTRL+Z]",
      [EditorTool.Redo]: "Redo [CTRL+SHFT+Z]",
    }[tool];
    return (
      <button
        className={cx(styles.editorToolSprite, toolClassName, {
          [styles.active]: tool === activeTool,
          [styles.hasUndo]: hasUndo,
          [styles.hasRedo]: hasRedo,
        })}
        onClick={() => handleSetTool(tool)}
      >
        {toolLabel && (
          <span
            className={cx("tooltip", styles.tooltip, {
              [styles.red]: tool === EditorTool.Bomb,
            })}
          >
            {toolLabel}
          </span>
        )}
      </button>
    );
  };
  return (
    <div className={styles.editorTools}>
      <h1 className={styles.editorTitle}>
        SNEK
        <br />
        EDITOR
      </h1>
      <div className={styles.editorToolsOffset}>
        {renderTool(EditorTool.Pencil)}
        {renderTool(EditorTool.Eraser)}
        {renderTool(EditorTool.Line)}
        {renderTool(EditorTool.Rectangle)}
        {renderTool(EditorTool.Undo)}
        {renderTool(EditorTool.Redo)}
        {renderTool(EditorTool.Bomb)}
      </div>
    </div>
  );
};
