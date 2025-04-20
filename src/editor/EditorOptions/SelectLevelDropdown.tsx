import React, { useState } from "react";

import { CHALLENGE_LEVELS, LEVELS, LEVEL_01, SECRET_LEVELS } from "../../levels";

import { Level } from "../../types";
import { Stack } from "../components/Stack";
import { DropdownField, Option } from "../components/Field/DropdownField";

import * as styles from './EditorOptions.css'

interface SelectLevelDropdownProps {
  loadLevel: (level: Level) => void;
}

export const SelectLevelDropdown = ({ loadLevel }: SelectLevelDropdownProps) => {
  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVEL_01);

  const levelsToInclude = [
    ...LEVELS,
    ...SECRET_LEVELS,
    ...CHALLENGE_LEVELS,
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
    <Stack justify="start">
      <DropdownField
        label="Load Campaign Level"
        options={levelOptions}
        value={selectedOption}
        onChange={handleSetLevel}
      />
      <button className={styles.buttonLoadLevel} onClick={handleLoadLevel}>Load</button>
    </Stack>
  )
}