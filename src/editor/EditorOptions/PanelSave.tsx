import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

import { EditorData, EditorOptions, Level } from "../../types";
import { encodeMapData } from "../utils/editorUtils";
import { Stack } from "../components/Stack";
import { DropdownField, Option } from "../components/Field/DropdownField";
import { LEVELS, LEVEL_01 } from "../../levels";

import * as styles from './EditorOptions.css'
import { useUndoRedo } from "../hooks/useUndoRedo";

interface PanelSaveProps {
  data: EditorData;
  options: EditorOptions;
  loadLevel: (level: Level) => void;
  undo: () => void;
  redo: () => void;
}

export const PanelSave = ({ data, options, loadLevel, redo, undo }: PanelSaveProps) => {
  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVEL_01);
  const panelRef = useRef<HTMLDivElement>();

  useUndoRedo(panelRef, redo, undo);

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

  const levelsToInclude = LEVELS;

  const handleSetLevel = (option: Option) => {
    const levelName = option.value;
    const match = levelsToInclude.find(level => level.name === levelName);
    if (!match) return;
    setSelectedLevel(match);
  }

  const handleLoadLevel = () => {
    loadLevel(selectedLevel);
  }

  const toOption = (level: Level): Option => ({
    value: level.name,
    label: level.name,
  })
  const levelOptions: Option[] = levelsToInclude.map(toOption);
  const selectedOption = levelOptions.find(option => option.value === selectedLevel.name) || toOption(selectedLevel);

  return (
    <div ref={panelRef}>
      <Stack marginBottom>
        <button onClick={handleSave}>Save</button>
      </Stack>
      <Stack justify="start">
        <DropdownField
          label="Load Campaign Level"
          options={levelOptions}
          value={selectedOption}
          onChange={handleSetLevel}
        />
        <button className={styles.buttonLoadLevel} onClick={handleLoadLevel}>Load</button>
      </Stack>
    </div>
  );
}
