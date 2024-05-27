
import React, { useRef, useState } from "react";
import { EditorData } from "../../types";
import { EDITOR_DEFAULTS } from "../editorConstants";

type UseEditorDataReturn = [
  EditorData,
  React.MutableRefObject<EditorData>,
  (setter: (data: EditorData) => EditorData) => void
]

export const useEditorData = (): UseEditorDataReturn => {
  const [data, _setData] = useState<EditorData>(EDITOR_DEFAULTS.data)
  const dataRef = useRef(data);
  dataRef.current = data;

  const setData = (setter: (data: EditorData) => EditorData) => {
    _setData(prev => {
      const val = setter(prev);
      dataRef.current = val;
      return val;
    });
  }

  return [data, dataRef, setData];
}
