import React, { useEffect, useMemo, useRef } from "react"

import { EditorData, EditorOptions } from "../types";

import { encodeMapData } from "./utils/editorUtils";
import { getRelativeDir } from "../utils";

import * as styles from './Editor.css';

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
    return `/snek-js/preview/?disableFullscreen=true&editorPreview=true&data=${encoded}`;
  }, [data, options, isPreviewShowing]);

  useEffect(() => {
    if (iframeRef.current && isPreviewShowing) {
      iframeRef.current.focus();
    }
  }, [isPreviewShowing, iframeRef]);

  const handleFullscreen = () => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow.postMessage('fullscreen');
    iframeRef.current.focus();
  };

  if (!isPreviewShowing) return null;

  return (
    <div className={styles.mapPreviewOverlay} onClick={() => setPreviewShowing(false)}>
      <div className={styles.mapPreviewLayout}>
        <div className={styles.mapPreviewContainer} onClick={(ev) => { ev.stopPropagation(); }}>
          <button title="Close" className={styles.closeButton} onClick={() => setPreviewShowing(false)}>x</button>
          <iframe
            ref={iframeRef}
            src={url}
            allowFullScreen
            allow-same-origin="true"
            allow-scripts="true"
            width="1200"
            height="1200"
            className={styles.mapPreview}
          />
          <button title="Fullscreen" className={styles.fullscreenButton} onClick={handleFullscreen}>
            <img src={`${getRelativeDir()}/assets/graphics/editor-fullscreen.png`} />
          </button>
        </div>
      </div>
    </div>
  )
}
