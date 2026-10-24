import React from "react";
import { SetStateValue } from "../editorTypes";

import * as styles from '../Editor.css';
import { ToggleField } from "@/components/Field";
import { EditorOptions } from "@/types";

interface Props {
  isOptionsDialogShowing: boolean,
  options: EditorOptions;
  setOptionsDialogShowing: (val: SetStateValue<boolean>) => void,
  setOptions: (value: SetStateValue<EditorOptions>) => void;
}
export const OptionsDialog = ({
  options,
  isOptionsDialogShowing,
  setOptions,
  setOptionsDialogShowing,
}: Props) => {
  if (!isOptionsDialogShowing) return;
  return (
    <div className={styles.mapPreviewOverlay} onClick={() => setOptionsDialogShowing(false)}>
      <div
        className={styles.mapPreviewLayout}
        style={{
          justifyContent: 'flex-start',
          paddingLeft: 200,
        }}
      >
        <div
          className={styles.mapPreviewContainer}
          onClick={(ev) => { ev.stopPropagation(); }}
          style={{
            transform: 'none',
            width: 'auto',
            height: 'auto',
            minWidth: 480,
            minHeight: 480,
          }}
        >
          <button
            title="Close"
            className={styles.closeButton}
            onClick={() => setOptionsDialogShowing(false)}
            style={{ transform: 'none' }}
          >x</button>
          <div style={{ padding: 20 }}>
            <h2>Options</h2>
            <h4>Visibility</h4>
            <ToggleField
              label="Show Map Annotations"
              name="showAnnotations"
              checked={options.showAnnotations}
              onChange={(val) => setOptions({ ...options, showAnnotations: val })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
