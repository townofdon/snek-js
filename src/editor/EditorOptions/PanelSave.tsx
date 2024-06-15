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
import { drawShareImage, getCanvasImage } from "../utils/publishUtils";
import { getToken, publishMap, uploadMapImage } from "../../api/map";
import { editorStore } from "../../stores/EditorStore";

interface PanelSaveProps {
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  data: EditorData;
  options: EditorOptions;
  loadLevel: (level: Level) => void;
  undo: () => void;
  redo: () => void;
}

export const PanelSave = ({ canvas, data, options, loadLevel, redo, undo }: PanelSaveProps) => {
  const publishCanvas = useRef<HTMLCanvasElement>();
  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVEL_01);
  const panelRef = useRef<HTMLDivElement>();

  useUndoRedo(panelRef, redo, undo);

  const handlePublish = async () => {
    if (!canvas.current) return;
    try {
      const mapImageDataUrl = canvas.current.toDataURL('image/png');
      const mapName = options.name;
      const ctx = publishCanvas.current.getContext('2d');
      await drawShareImage(ctx, options.palette, mapImageDataUrl, mapName);
      const encoded = encodeMapData(data, options);
      const [file, xsrfToken] = await Promise.all([
        getCanvasImage(publishCanvas.current),
        getToken(),
      ]);
      const authorName = editorStore.getAuthor();
      const res = await publishMap(options.name, authorName, encoded, { xsrfToken });
      await uploadMapImage(file, res.supameta, res.upload);
    } catch (err) {
      toast.error('Unable to publish map');
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
        <button onClick={handlePublish}>Publish</button>
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

      <div>
        <canvas ref={publishCanvas} width={1200} height={630} style={{
          // display: 'none',
          width: '100%',
          height: 'auto',
        }} />
      </div>
    </div>
  );
}
