import React, { useState } from "react";

import { CHALLENGE_LEVELS, LEVELS, SECRET_LEVELS } from "../../levels/levelConstants";
import { LEVEL_01 } from "../../levels/campaign/level01";

import { Level } from "../../types";
import { Stack } from "@/components/Stack";
import { DropdownField, Option } from "@/components/Field/DropdownField";

import * as styles from './EditorOptions.css'
import { LEVEL_01_HARD } from "@/levels/campaign/level01hard";
import { LEVEL_01_ULTRA } from "@/levels/campaign/level01ultra";

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
    const id = option.value;
    const match = levelsToInclude.find(level => level.id === id);
    if (!match) return;
    setSelectedLevel(match);
  }

  const handleLoadLevel = () => {
    loadLevel(selectedLevel);
  }

  const toOption = (level: Level): Option => ({
    value: level.id,
    label: EDITOR_LEVEL_NAME_OVERRIDE[level.id] || level.name,
  })
  const levelOptions: Option[] = levelsToInclude.map(toOption);

  return (
    <Stack justify="start">
      <DropdownField
        label="Load Campaign Level"
        options={levelOptions}
        value={selectedLevel.id}
        defaultValue={LEVEL_01.id}
        onChange={handleSetLevel}
      />
      <button className={styles.buttonLoadLevel} onClick={handleLoadLevel}>Load</button>
    </Stack>
  )
}

const EDITOR_LEVEL_NAME_OVERRIDE = {
  [LEVEL_01_HARD.id]: 'snekadia (hard)',
  [LEVEL_01_ULTRA.id]: 'snekadia (ultra)',
} as const
