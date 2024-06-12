import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

import { EditorData, EditorOptions, Level } from "../../types";
import { encodeMapData } from "../utils/editorUtils";
import { Stack } from "../components/Stack";
import { DropdownField, Option } from "../components/Field/DropdownField";
import { LEVELS, LEVEL_01, VARIANT_LEVEL_99 } from "../../levels";

import * as styles from './EditorOptions.css'
import { useUndoRedo } from "../hooks/useUndoRedo";
import { SECRET_LEVEL_10 } from "../../levels/bonusLevels/secretLevel10";
import { SECRET_LEVEL_20 } from "../../levels/bonusLevels/secretLevel20";
import { SECRET_LEVEL_21 } from "../../levels/bonusLevels/secretLevel21";
import { VARIANT_LEVEL_03 } from "../../levels/bonusLevels/variantLevel03";
import { VARIANT_LEVEL_05 } from "../../levels/bonusLevels/variantLevel05";
import { VARIANT_LEVEL_07 } from "../../levels/bonusLevels/variantLevel07";
import { VARIANT_LEVEL_08 } from "../../levels/bonusLevels/variantLevel08";
import { VARIANT_LEVEL_10 } from "../../levels/bonusLevels/variantLevel10";
import { VARIANT_LEVEL_15 } from "../../levels/bonusLevels/variantLevel15";

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

  const levelsToInclude = [
    ...LEVELS,
    SECRET_LEVEL_10,
    SECRET_LEVEL_20,
    SECRET_LEVEL_21,
    VARIANT_LEVEL_03,
    VARIANT_LEVEL_05,
    VARIANT_LEVEL_07,
    VARIANT_LEVEL_08,
    VARIANT_LEVEL_10,
    VARIANT_LEVEL_15,
    VARIANT_LEVEL_99,
  ];

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
