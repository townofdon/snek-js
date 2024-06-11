import React, { useState } from "react";
import toast from "react-hot-toast";

import { EditorData, EditorOptions, Level } from "../../types";
import { encodeMapData, getEditorDataFromLevel } from "../utils/editorUtils";
import { Stack } from "../components/Stack";
import { DropdownField } from "../components/Field/DropdownField";
import { LEVELS, LEVEL_01 } from "../../levels";

import * as styles from './EditorOptions.css'

interface PanelSaveProps {
  data: EditorData;
  options: EditorOptions;
  setData: (data: EditorData) => void;
  setOptions: (options: EditorOptions) => void;
}

export const PanelSave = ({ data, options, setData, setOptions }: PanelSaveProps) => {
  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVEL_01)

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

  const handleSetLevel = (levelName: string) => {
    const match = levelsToInclude.find(level => level.name === levelName);
    if (!match) return;
    setSelectedLevel(match);
  }

  const handleLoadLevel = () => {
    const [data, options] = getEditorDataFromLevel(selectedLevel);
    setData(data);
    setOptions(options);
  }

  const levelOptions = levelsToInclude.map(level => level.name);

  return (
    <div>
      <Stack marginBottom>
        <button onClick={handleSave}>Save</button>
      </Stack>
      <Stack justify="start">
        <DropdownField
          label="Load Campaign Level"
          options={levelOptions}
          value={selectedLevel.name}
          onChange={handleSetLevel}
        />
        <button className={styles.buttonLoadLevel} onClick={handleLoadLevel}>Load</button>
      </Stack>
    </div>
  );
}
