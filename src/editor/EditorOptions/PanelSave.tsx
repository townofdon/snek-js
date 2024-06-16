import React, { useEffect, useRef, useState } from "react";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import toast from "react-hot-toast";

import { EditorData, EditorOptions } from "../../types";
import { encodeMapData } from "../utils/editorUtils";
import { getGraphicsDir } from "../../utils";
import { drawShareImage, getCanvasImage, getShareUrl } from "../utils/publishUtils";
import { getToken, publishMap, uploadMapImage } from "../../api/map";
import { editorStore } from "../../stores/EditorStore";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { Stack } from "../components/Stack";
import { Field } from "../components/Field";
import { PreviewShareDialog } from "./PreviewShareDialog";
import { PublishButton } from "./PublishButton";
import { CopyLink } from "./CopyLink";

import * as styles from './EditorOptions.css';

interface PanelSaveProps {
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  data: EditorData;
  options: EditorOptions;
  mapId: string;
  setMapId: (val: string) => void;
  undo: () => void;
  redo: () => void;
}

export const PanelSave = ({ canvas, data, options, mapId, setMapId, redo, undo }: PanelSaveProps) => {
  const publishCanvas = useRef<HTMLCanvasElement>();
  const panelRef = useRef<HTMLDivElement>();
  const [isPreviewShowing, _setPreviewShowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [author, _setAuthor] = useState(editorStore.getAuthor());

  useUndoRedo(panelRef, redo, undo);

  useEffect(() => {
    generateShareImage();
  }, [])

  const setAuthor = (val: string) => {
    _setAuthor(val);
    editorStore.setAuthor(val);
    generateShareImage(val);
  }

  const setPreviewShowing = (val: boolean) => {
    _setPreviewShowing(val);
    setTimeout(() => {
      generateShareImage();
    }, 0);
  }

  const generateShareImage = async (overrideAuthor?: string) => {
    const mapWidth = canvas.current.width;
    const mapHeight = canvas.current.height;
    const mapImageDataUrl = canvas.current.toDataURL('image/png');
    const mapName = options.name;
    const ctx = publishCanvas.current.getContext('2d');
    await drawShareImage(ctx, mapWidth, mapHeight, options.palette, mapImageDataUrl, mapName, overrideAuthor ?? author);
  }

  const getSaveData = async (): Promise<[string, File, string]> => {
    if (!canvas.current) return;
    await generateShareImage();
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
      setLoading(true);
      const isUpdate = !!mapId;
      const [encoded, file, xsrfToken] = await getSaveData();
      const res = await publishMap(mapId, options.name, author, encoded, { xsrfToken });
      await uploadMapImage(file, res.supameta, res.upload);
      setMapId(res.id);
      toast.success(isUpdate ? 'Successfully updated map' : 'Successfully published map');
    } catch (err) {
      toast.error('Unable to publish map');
      console.error(err.message);
    } finally {
      setLoading(false);
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
      <CopyLink />
      <hr />
      <Stack marginBottom row align="center" justify="spaceBetween">
        <PublishButton loading={loading} hasMapId={!!mapId} onPublish={handlePublish} />
      </Stack>
      <Stack>
        <PreviewShareDialog
          publishCanvas={(
            <canvas
              ref={publishCanvas}
              width={1200}
              height={630}
              onClick={() => !isPreviewShowing && setPreviewShowing(true)}
              style={{
                width: isPreviewShowing ? 900 : 356,
                height: isPreviewShowing ? 472.5 : 'auto',
                cursor: isPreviewShowing ? 'initial' : 'pointer',
              }}
            />
          )}
          isShowing={isPreviewShowing}
          setShowing={setPreviewShowing}
        />
      </Stack>
      {mapId ? (
        <Stack col align="center" marginTop>
          <Stack row align="center" className={styles.socialContainer}>
            <h2 className={styles.shareHeading}>
              <span>Share</span>
            </h2>
            <FacebookShareButton url={getShareUrl(mapId)} className={styles.socialButton} style={{ margin: 0 }}>
              <img src={getGraphicsDir('editor-social-icon-fb.png')} width={48} height={48} />
            </FacebookShareButton>
            <TwitterShareButton url={getShareUrl(mapId)} className={styles.socialButton}>
              <img src={getGraphicsDir('editor-social-icon-twitter.png')} width={48} height={48} />
            </TwitterShareButton>
          </Stack>
        </Stack>
      ) : (
        null
      )}
    </div>
  );
}
