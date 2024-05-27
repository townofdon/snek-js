import React from "react";
import { useEditorData } from "./hooks/useEditorData";
import { EditorCanvas } from "./editorCanvas";

export const Editor = () => {
  const [data, dataRef, setData] = useEditorData();
  return <EditorCanvas data={data} />
}
