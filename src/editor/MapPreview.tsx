import React, { useEffect, useMemo, useRef } from "react"

import { EditorData, EditorOptions } from "../types";

import * as styles from './Editor.css';
import { encodeMapData } from "./utils/editorUtils";

interface MapPreviewProps {
  data: EditorData,
  options: EditorOptions,
  isPreviewShowing: boolean,
  setPreviewShowing: (val: boolean) => void,
}

export const MapPreview = ({ data, options, isPreviewShowing, setPreviewShowing }: MapPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const url = useMemo(() => {
    if (!isPreviewShowing) return '';
    const encoded = encodeMapData(data, options);
    return `/snek-js/?data=${encoded}`;
  }, [data, options, isPreviewShowing]);

  useEffect(() => {
    if (iframeRef.current && isPreviewShowing) {
      iframeRef.current.focus();
    }
  }, [isPreviewShowing, iframeRef])

  if (!isPreviewShowing) return null;

  return (
    <div className={styles.mapPreviewOverlay}>
      <div className={styles.mapPreviewLayout}>
        <div className={styles.mapPreviewContainer}>
          <button title="Close" className={styles.closeButton} onClick={() => setPreviewShowing(false)}>x</button>
          <iframe
            ref={iframeRef}
            src={url}
            allowFullScreen
            allow-same-origin="true"
            allow-scripts="true"
            width="600"
            height="600"
            className={styles.mapPreview}
          />
        </div>
      </div>
    </div>
  )
}
