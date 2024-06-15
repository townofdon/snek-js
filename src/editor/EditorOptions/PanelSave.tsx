import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

import { EditorData, EditorOptions } from "../../types";
import { encodeMapData } from "../utils/editorUtils";
import { drawShareImage, getCanvasImage } from "../utils/publishUtils";
import { getToken, publishMap, uploadMapImage } from "../../api/map";
import { editorStore } from "../../stores/EditorStore";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { Stack } from "../components/Stack";
import { Field } from "../components/Field";

import * as styles from './EditorOptions.css';

interface PanelSaveProps {
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  data: EditorData;
  options: EditorOptions;
  undo: () => void;
  redo: () => void;
}

export const PanelSave = ({ canvas, data, options, redo, undo }: PanelSaveProps) => {
  const publishCanvas = useRef<HTMLCanvasElement>();
  const panelRef = useRef<HTMLDivElement>();
  const [author, setAuthor] = useState(editorStore.getAuthor());

  useUndoRedo(panelRef, redo, undo);

  const handlePublish = async () => {
    if (!canvas.current) return;
    try {
      const mapImageDataUrl = canvas.current.toDataURL('image/png');
      const mapName = options.name;
      const ctx = publishCanvas.current.getContext('2d');
      await drawShareImage(ctx, options.palette, mapImageDataUrl, mapName, author);
      const encoded = encodeMapData(data, options);
      const [file, xsrfToken] = await Promise.all([
        getCanvasImage(publishCanvas.current),
        getToken(),
      ]);
      const res = await publishMap(options.name, author, encoded, { xsrfToken });
      await uploadMapImage(file, res.supameta, res.upload);
      editorStore.setAuthor(author);
    } catch (err) {
      toast.error('Unable to publish map');
      console.error(err.message);
    }
  }

  return (
    <div ref={panelRef}>
      <Field
        type="text"
        name="author"
        label="Map Author"
        caption="Leave blank to publish anonymously"
        value={author}
        placeholder="Anonymous"
        onChange={(val) => setAuthor(val)}
      />

      <Stack marginBottom>
        <button className={styles.publishButton} onClick={handlePublish}>Publish</button>
      </Stack>

      <div>
        <canvas ref={publishCanvas} width={1200} height={630} style={{
          width: '330px',
          height: 'auto',
        }} />
      </div>
    </div>
  );
}
