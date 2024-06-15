import React, { useState } from "react";

import { LEVELS, LEVEL_01, VARIANT_LEVEL_99 } from "../../levels";
import { SECRET_LEVEL_10 } from "../../levels/bonusLevels/secretLevel10";
import { SECRET_LEVEL_20 } from "../../levels/bonusLevels/secretLevel20";
import { SECRET_LEVEL_21 } from "../../levels/bonusLevels/secretLevel21";
import { VARIANT_LEVEL_03 } from "../../levels/bonusLevels/variantLevel03";
import { VARIANT_LEVEL_05 } from "../../levels/bonusLevels/variantLevel05";
import { VARIANT_LEVEL_07 } from "../../levels/bonusLevels/variantLevel07";
import { VARIANT_LEVEL_08 } from "../../levels/bonusLevels/variantLevel08";
import { VARIANT_LEVEL_10 } from "../../levels/bonusLevels/variantLevel10";
import { VARIANT_LEVEL_15 } from "../../levels/bonusLevels/variantLevel15";

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