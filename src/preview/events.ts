import { validEditorData } from "@/editor/editorTypes";
import { EditorData } from "@/types";
import EventEmitter from "eventemitter3";

const EE = new EventEmitter();

const PreviewEvent = 'PreviewEvent'

export const emitEditorData = (data: EditorData) => {
  EE.emit(PreviewEvent, data);
}

export const onEditorData = (handler: (data: EditorData) => void) => {
  EE.on(PreviewEvent, handler);
}

export const offEditorData = (handler: (data: EditorData) => void) => {
  EE.off(PreviewEvent, handler);
}

window.addEventListener("message", (event) => {
  if (event.data === 'fullscreen') {
    document.body.requestFullscreen();
  } else if (validEditorData(event.data)) {
    console.log(event.data);
    emitEditorData(event.data);
  }
});
