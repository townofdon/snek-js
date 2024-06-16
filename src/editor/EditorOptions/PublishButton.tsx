import React, {  } from "react";
import cx from "classnames";

import { getGraphicsDir } from "../../utils";

import * as editorStyles from '../Editor.css';
import * as styles from './EditorOptions.css';

interface PublishButtonProps {
  loading: boolean;
  hasMapId: boolean;
  onPublish: () => void;
}

export const PublishButton = ({ loading, hasMapId, onPublish }: PublishButtonProps) => {
  const content = hasMapId ? (
    <>
      <span>Sync</span>
      <img src={`${getGraphicsDir()}/editor-publish-update.png`} width={32} height={32} style={{ opacity: 0.8 }} />
    </>
  ) : (
    <>
      <span>Publish</span>
      <img src={`${getGraphicsDir()}/editor-publish.png`} width={32} height={32} />
    </>
  );
  return (
    <button
      className={cx(styles.publishMapButton, {
        [styles.loading]: loading,
      })}
      onClick={onPublish}
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
