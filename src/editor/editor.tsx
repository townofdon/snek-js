import React, { useState } from "react";
import { DIR, EditorData } from "../types";
import { Vector } from "p5";
import { EDITOR_DEFAULTS } from "./editorConstants";

export const editorMain = () => {
  const [data, _setData] = useState<EditorData>(EDITOR_DEFAULTS.data)

  const setData = (setter: (data: EditorData) => EditorData) => {
    _setData(setter);
  }
  return <h1>HOWDY REACT</h1>
}
