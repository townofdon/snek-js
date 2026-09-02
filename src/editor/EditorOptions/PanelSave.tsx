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
import { Stack } from "@/components/Stack";
import { Field } from "@/components/Field";
import { PreviewShareDialog } from "./PreviewShareDialog";
import { PublishButton } from "./PublishButton";
import { CopyLink } from "./CopyLink";

import { IS_DEV } from "../../constants";
import { CopyLinkDev } from "./CopyLinkDev";
import { MapSaveData, SetStateValue } from "../editorTypes";
import { pruneMap, readMapDataFromFile, saveMapDataToDisk } from "../utils/saveUtils";
import { Button } from "@/components/Button";

import { Command, ImportMapDataCommand } from "../commands";

import * as editorStyles from '@/editor/Editor.css';
import * as styles from './EditorOptions.css';

interface PanelSaveProps {
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  data: EditorData;
  options: EditorOptions;
  mapId: string;
  setMapId: (val: string) => void;
  setData: (data: EditorData) => void;
  setOptions: (value: SetStateValue<EditorOptions>) => void;
  undo: () => void;
  redo: () => void;
  executeCommand: (command: Command) => void;
}

export const PanelSave = ({
  canvas,
  data,
  options,
  mapId,
  setMapId,
  setData,
  setOptions,
  redo,
  undo,
  executeCommand,
}: PanelSaveProps) => {
  const publishCanvas = useRef<HTMLCanvasElement>();
  const panelRef = useRef<HTMLDivElement>();
  const [isPreviewShowing, _setPreviewShowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [author, _setAuthor] = useState(editorStore.getAuthor());
  const fileInputRef = useRef<HTMLInputElement>();

  useUndoRedo(panelRef, redo, undo);

  useEffect(() => {
    generateShareImage();
  }, []);

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

  const getPublishData = async (): Promise<[string, File, string]> => {
    if (!canvas.current) return;
    await generateShareImage();
    const encoded = encodeMapData(data, options);
    const [file, xsrfToken] = await Promise.all([
      getCanvasImage(publishCanvas.current, `map-${Date.now()}.png`),
      getToken(),
    ]);
    return [encoded, file, xsrfToken];
  }

  const handlePublish = async () => {
    try {
      if (!canvas.current) throw new Error('canvas not set');
      setLoading(true);
      const isUpdate = !!mapId;
      const [encoded, file, xsrfToken] = await getPublishData();
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  }

  const handleInputFileChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    const files = ev.target.files;
    if (files.length <= 0) return;
    (async () => {
      const mapSaveData = await readMapDataFromFile(files[0]);
      const command = new ImportMapDataCommand(mapSaveData, data, options, setData, setOptions);
      executeCommand(command);
      toast(`Imported Map`, {
        icon: "✓",
        duration: 2500,
        position: "bottom-right",
        className: editorStyles.toastRedo,
      });
    })();
  }

  const handleSaveToDisk = async () => {
    try {
      if (!canvas.current) throw new Error('canvas not set');
      setLoading(true);
      const encoded = encodeMapData(data, options);
      const saveData = {
        mapId: "123",
        name: options.name,
        author,
        mapData: encoded,
        annotations: pruneMap(data.annotations),
        pipeOverrides: pruneMap(data.pipeOverrides),
        overlayImagePath: null,
      } satisfies MapSaveData;
      saveMapDataToDisk(saveData);
      toast.success('Successfully saved map');
    } catch (err) {
      toast.error('Unable to save map');
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
      <CopyLink data={data} options={options} />
      <hr />
      {IS_DEV && (
        <Stack marginBottom row align="center" justify="spaceBetween">
          <CopyLinkDev />
        </Stack>
      )}
      <div>
        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleInputFileChange} />
      </div>
      <Stack row align="center" justify="spaceBetween">
        <Stack marginBottom row align="center" justify="spaceBetween">
          <Button
            className={styles.importMapButton}
            loading={loading}
            onClick={handleImportClick}
          >
            <span style={{ whiteSpace: 'nowrap' }}>&lt;&lt; Import</span>
          </Button>
          <Button
            className={styles.exportMapButton}
            loading={loading}
            onClick={handleSaveToDisk}
          >
            <span style={{ whiteSpace: 'nowrap' }}>Export &gt;&gt;</span>
          </Button>
        </Stack>
      </Stack>
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
              <span>Share!</span>
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
