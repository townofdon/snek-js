import React, { useMemo, useState } from "react";

import { getGraphicsDir } from "../../utils";

import * as editorStyles from '../Editor.css';
import * as styles from './EditorOptions.css';

interface PreviewShareDialogProps {
  publishCanvas: React.ReactNode;
  isShowing: boolean;
  setShowing: (val: boolean) => void;
}

export const PreviewShareDialog = ({ publishCanvas, isShowing, setShowing }: PreviewShareDialogProps) => {
  if (!isShowing) {
    return (
      <div className={styles.sharePreviewContainer}>
        {publishCanvas}
        <button title="Preview" className={styles.sharePreviewButton} onClick={() => setShowing(true)}>
          <img src={`${getGraphicsDir()}/editor-fullscreen.png`} />
        </button>
      </div>
    );
  }

  return (
    <div className={editorStyles.modalOverlay} onClick={() => setShowing(false)}>
      <div className={editorStyles.modalLayout}>
        <div className={editorStyles.modalContainer} onClick={(ev) => { ev.stopPropagation(); }}>
          <button title="Close" className={editorStyles.closeButton} onClick={() => setShowing(false)}>x</button>
          {publishCanvas}
        </div>
      </div>
    </div>
  );
}
