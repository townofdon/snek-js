import throttle from "throttleit";
import { useEffect } from "react";

import { EditorData, EditorOptions } from "../../types";
import { encodeMapData } from "../utils/editorUtils";
import { EDITOR_DEFAULTS } from "../editorConstants";


interface UseUpdateUrlArgs {
  initialized: boolean,
  data: EditorData,
  options: EditorOptions,
}
export const useUpdateUrl = ({ initialized, data, options }: UseUpdateUrlArgs) => {
  useEffect(() => {
    if (!initialized) return;
    if (data === EDITOR_DEFAULTS.data && options === EDITOR_DEFAULTS.options) return;
    setUrl(data, options);
  }, [initialized, data, options]);
}

const setUrl = throttle((data: EditorData, options: EditorOptions) => {
  try {
    const encoded = encodeMapData(data, options);
    const url = new URL(window.location.href);
    url.searchParams.set("data", encoded);
    history.pushState(null, "", url);
  } catch (err) {
    console.error(err);
  }
}, 800);
