import { useEffect, useRef, useState } from "react";

import { EditorData, EditorOptions } from "../../types";
import { encodeMapData } from "../utils/editorUtils";
import { EDITOR_DEFAULTS } from "../editorConstants";

const UPDATE_URL_DELAY = 800;

interface UseUpdateUrlArgs {
  initialized: boolean,
  data: EditorData,
  options: EditorOptions,
}
export const useUpdateUrl = ({ initialized, data, options }: UseUpdateUrlArgs) => {
  const [isSynced, setSynced] = useState(true);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const touched = useRef(false);

  useEffect(() => {
    if (!initialized) return;
    if (!touched.current && data === EDITOR_DEFAULTS.data && options === EDITOR_DEFAULTS.options) return;
    setSynced(false);
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      setUrl(data, options);
      setSynced(true);
      touched.current = true;
    }, UPDATE_URL_DELAY);
  }, [initialized, data, options]);

  return isSynced;
}

const setUrl = (data: EditorData, options: EditorOptions) => {
  try {
    const encoded = encodeMapData(data, options);
    const url = new URL(window.location.href);
    url.searchParams.set("data", encoded);
    history.pushState(null, "", url);
  } catch (err) {
    console.error(err);
  }
};
