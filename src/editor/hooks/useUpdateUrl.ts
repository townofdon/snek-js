import { useEffect, useRef } from "react";
import { v4 as uuid } from 'uuid';

import { EditorData, EditorOptions } from "../../types";
import { encodeMapData } from "../utils/editorUtils";
import { EDITOR_DEFAULTS } from "../editorConstants";
import { editorMapMetadataStore } from "@/stores/EditorMapStore";

const UPDATE_URL_DELAY = 800;

interface UseUpdateUrlArgs {
  initialized: boolean,
  data: EditorData,
  mapId: string,
  options: EditorOptions,
  synced: boolean,
  setSynced: React.Dispatch<React.SetStateAction<boolean>>,
  setMapId: (id: string) => void;
}
export const useUpdateUrl = ({ initialized, data, mapId, options, synced, setSynced, setMapId }: UseUpdateUrlArgs) => {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const touched = useRef(false);

  // sync url
  useEffect(() => {
    if (!initialized) return;
    if (!touched.current && data === EDITOR_DEFAULTS.data && options === EDITOR_DEFAULTS.options) return;
    setSynced(false);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      const needsMapId = !mapId;
      mapId ||= uuid();
      if (needsMapId) {
        setMapId(mapId);
      }
      setUrl(mapId, data, options);
      setSynced(true);
      touched.current = true;
      editorMapMetadataStore.set(mapId, data);
    }, UPDATE_URL_DELAY);
  }, [initialized, data, mapId, options]);

  return synced;
}

const setUrl = (mapId: string, data: EditorData, options: EditorOptions) => {
  try {
    const encoded = encodeMapData(data, options);
    const url = new URL(window.location.href);
    if (mapId) {
      url.searchParams.set("id", mapId);
    } else {
      url.searchParams.delete("id");
    }
    url.searchParams.set("data", encoded);
    history.pushState(null, "", url);
  } catch (err) {
    console.error(err);
  }
};
