import React from "react";
import toast from "react-hot-toast";

import { EditorData, EditorOptions } from "../../types";
import { encodeMapData } from "../utils/editorUtils";

interface PanelSaveProps {
  data: EditorData;
  options: EditorOptions;
  setOptions: (options: EditorOptions) => void;
}

export const PanelSave = ({ data, options, setOptions }: PanelSaveProps) => {
  const handleSave = () => {
    // TODO: update url without reloading the page - see:
    // - https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
    // - https://stackoverflow.com/a/3354511 - popstate event
    try {
      const encoded = encodeMapData(data, options);
      const query = new URLSearchParams(window.location.search);
      query.set('data', encoded);
      window.location.search = query.toString();
      } catch (err) {
      toast.error('Unable to save map');
      console.error(err.message);
    }
  }

  return (
    <div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
