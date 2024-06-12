import React, { useEffect } from "react";
import { getIsOutside, isCharPressed } from "../utils/keyboardUtils";

export const useUndoRedo = (containerRef: React.MutableRefObject<HTMLElement | HTMLDivElement>, redo: () => void, undo: () => void) => {
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (getIsOutside(ev, containerRef)) return;
      if (isCharPressed(ev, 'z', { ctrlKey: true, shiftKey: true }) || isCharPressed(ev, 'y', { ctrlKey: true })) {
        redo();
      } else if (isCharPressed(ev, 'z', { ctrlKey: true })) {
        undo();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    }
  }, []);
}
