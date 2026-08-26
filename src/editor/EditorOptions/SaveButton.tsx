import React, {  } from "react";
import cx from "classnames";

import { getGraphicsDir } from "../../utils";

import * as editorStyles from '../Editor.css';
import * as styles from './EditorOptions.css';

interface SaveButtonProps {
  loading: boolean;
  onSave: () => void;
}

export const SaveButton = ({ loading, onSave }: SaveButtonProps) => {
  const content = (
    <>
      <span>Save To Disk</span>
      <img src={`${getGraphicsDir()}/editor-publish.png`} width={32} height={32} />
    </>
  );
  return (
    <button
      className={cx(styles.saveMapButton, {
        [styles.loading]: loading,
      })}
      onClick={onSave}
      disabled={loading}
    >
      {loading ? (
        <span className={cx(editorStyles.loader30, styles.loader)} />
      ) : (
        content
      )}
    </button>
  );
}
