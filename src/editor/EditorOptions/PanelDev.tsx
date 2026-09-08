import React, { useEffect, useRef, useState } from "react";
import { EditorData, EditorOptions } from "@/types";
import toast from "react-hot-toast";
import cx from "classnames";

import { IS_DEV, IS_LOCALHOST } from "@/constants";
import { getGraphicsDir } from "@/utils";
import { Stack } from "@/components/Stack";
import { Button } from "@/components/Button";
import { Field, ToggleField } from "@/components/Field";
import { editorStore } from "@/stores/EditorStore";
import { editorMapMetadataStore } from "@/stores/EditorMapStore";
import { MapSaveData, SetStateValue } from "../editorTypes";
import { Command, ImportMapDataCommand } from "../commands";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { encodeMapData } from "../utils/editorUtils";
import { pruneMap, readMapDataFromFile, saveMapDataToDisk } from "../utils/saveUtils";
import { CopyLinkDev } from "./CopyLinkDev";

import * as editorStyles from '@/editor/Editor.css';
import * as styles from './EditorOptions.css';

interface PanelDevProps {
  data: EditorData;
  options: EditorOptions;
  mapId: string;
  synced: boolean,
  setMapId: (val: string) => void;
  setData: (data: EditorData) => void;
  setOptions: (value: SetStateValue<EditorOptions>) => void;
  undo: () => void;
  redo: () => void;
  executeCommand: (command: Command) => void;
}

export const PanelDev = ({ data, options, mapId, synced, setData, setOptions, redo, undo, executeCommand }: PanelDevProps) => {
  const panelRef = useRef<HTMLDivElement>();
  const fileInputRef = useRef<HTMLInputElement>();
  const [loading, setLoading] = useState(false);
  const [filePath, _setFilePath] = useState(editorMapMetadataStore.get(mapId).localFilePath);
  const [autoSync, setAutoSync] = useState(false);
  const tSetFile = useRef<NodeJS.Timeout>(null);
  const tAutoSync = useRef<NodeJS.Timeout>(null);

  const setFilePath = (incoming: string) => {
    clearTimeout(tSetFile.current);
    tSetFile.current = setTimeout(() => {
      editorMapMetadataStore.set(mapId, { ...data, localFilePath: incoming });
    }, 400);
    _setFilePath(incoming);
  }

  useUndoRedo(panelRef, redo, undo);

  const syncMapDisabled = loading || !filePath || !(/.*.ts$/.test(filePath));

  useEffect(() => {
    if (!autoSync) return;
    if (!synced) return;
    if (syncMapDisabled) return;
    tAutoSync.current = setTimeout(() => {
      syncMapToDisk(filePath, data, options)
    }, 400);
    return () => {
      clearTimeout(tAutoSync.current);
    }
  }, [autoSync, filePath, data, options, synced, syncMapDisabled]);

  if (!IS_DEV || !IS_LOCALHOST) return null;

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

  const handleExportToDisk = async () => {
    try {
      setLoading(true);
      const encoded = encodeMapData(data, options);
      const saveData = {
        mapId: "123",
        name: options.name,
        author: editorStore.getAuthor(),
        mapData: encoded,
        annotations: pruneMap(data?.annotations),
        pipeOverrides: pruneMap(data?.pipeOverrides),
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
      <Stack marginBottom row align="center" justify="spaceBetween">
        <CopyLinkDev />
      </Stack>
      <hr />
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
            onClick={handleExportToDisk}
          >
            <span style={{ whiteSpace: 'nowrap' }}>Export &gt;&gt;</span>
          </Button>
        </Stack>
      </Stack>
      <hr/>
      <Field
        type="text"
        name="filePath"
        label="Map File Path"
        caption="Relative path to the level file on disk."
        value={filePath}
        placeholder="src/levels/my-awesome-level.ts"
        onChange={(val) => setFilePath(val)}
        fullWidth
        className={styles.authorField}
        disabled={loading}
      />
      <ToggleField
        label="Auto Sync"
        name="autosync"
        checked={autoSync}
        onChange={(val) => setAutoSync(val)}
      />
      <button
        className={cx(styles.publishMapButton, {
          [styles.loading]: loading,
        })}
        onClick={() => syncMapToDisk(filePath, data, options)}
        disabled={syncMapDisabled}
      >
        {loading ? (
          <span className={cx(editorStyles.loader30, styles.loader)} />
        ) : (
          <>
            <img src={`${getGraphicsDir()}/editor-publish-update.png`} width={32} height={32} style={{ opacity: 0.8 }} />
            <span style={{ paddingLeft: 10 }} />
            <span>Sync Map File</span>
          </>
        )}
      </button>
    </div>
  );
};

const syncMapToDisk = async (filePath: string, data: EditorData, options: EditorOptions) => {
  try {
    const encoded = encodeMapData(data, options);
    const body = {
      path: filePath,
      annotations: data.annotations,
      layoutV2: encoded,
      url: location.href,
    };
    const res = await fetch('http://localhost:3001/write-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (res.status >= 400) {
      let errMsg: string = `${res.status} ${res.statusText}`;
      try {
        const errBody = await res.json();
        errMsg = errBody.err;
      } catch (err) {
        errMsg = `${res.status} ${res.statusText}`;
      }
      throw new Error(errMsg);
    }
    toast.success('Map synced!', { duration: 750, });
  } catch (err) {
    console.error(err);
    toast.error('Unable to sync map data');
  }
};
