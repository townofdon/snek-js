import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

import { EditorData, EditorOptions } from "../../types";
import { encodeMapData } from "../utils/editorUtils";
import { getGraphicsDir } from "../../utils";
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
  const [loading, setLoading] = useState(false);
  const [author, _setAuthor] = useState(editorStore.getAuthor());
  const [mapId, setMapId] = useState('');

  useUndoRedo(panelRef, redo, undo);

  const setAuthor = (val: string) => {
    _setAuthor(val);
    editorStore.setAuthor(val);
  }

  const getSaveData = async (): Promise<[string, File, string]> => {
    if (!canvas.current) return;
    const mapImageDataUrl = canvas.current.toDataURL('image/png');
    const mapName = options.name;
    const ctx = publishCanvas.current.getContext('2d');
    await drawShareImage(ctx, options.palette, mapImageDataUrl, mapName, author);
    const encoded = encodeMapData(data, options);
    const [file, xsrfToken] = await Promise.all([
      getCanvasImage(publishCanvas.current),
      getToken(),
    ]);
    return [encoded, file, xsrfToken];
  }

  const handlePublish = async () => {
    try {
      if (!canvas.current) throw new Error('canvas not set');
      const [encoded, file, xsrfToken] = await getSaveData();
      const res = await publishMap(options.name, author, encoded, { xsrfToken });
      setMapId(res.id);
      await uploadMapImage(file, res.supameta, res.upload);
    } catch (err) {
      toast.error('Unable to publish map');
      console.error(err.message);
    }
  }

  const handleUpdate = async () => {
    try {
      if (!canvas.current) throw new Error('canvas not set');
      const [encoded, file, xsrfToken] = await getSaveData();
      // const res = await publishMap(options.name, author, encoded, { xsrfToken });
      // setMapId(res.id);
      // await uploadMapImage(file, res.supameta, res.upload);
      // editorStore.setAuthor(author);
    } catch (err) {
      toast.error('Unable to update map');
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
        placeholder="Enter your hacker alias"
        onChange={(val) => setAuthor(val)}
        fullWidth
        className={styles.authorField}
        disabled={loading}
      />
      <hr />
      {loading ? (
        <Stack align="center" justify="center">
          <div className="loader" />
        </Stack>
      ) : (
        <Stack marginBottom>
          {mapId ? (
            <button className={styles.updateMapButton} onClick={handleUpdate}>
              <span>Update</span>
              <img src={`${getGraphicsDir()}/editor-publish-update.png`} width={32} height={32} />
            </button>
          ) : (
            <button className={styles.publishMapButton} onClick={handlePublish}>
              <span>Publish</span>
              <img src={`${getGraphicsDir()}/editor-publish.png`} width={32} height={32} />
            </button>
          )}
        </Stack>
      )}
      <div>
        <canvas ref={publishCanvas} width={1200} height={630} style={{
          display: 'none',
          width: '330px',
          height: 'auto',
        }} />
      </div>
    </div>
  );
}
