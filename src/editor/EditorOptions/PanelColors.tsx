import React, { useRef, useState } from "react";

import { EditorOptions, Palette, PipeVariant } from "../../types";
import { DropdownField, Field, Option } from "@/components/Field";
import { Stack } from "@/components/Stack";
import { SelectPalette } from "./SelectPalette";

import * as styles from './EditorOptions.css';
import { useUndoRedo } from "../hooks/useUndoRedo";
interface PanelColorsProps {
  options: EditorOptions;
  setPalette: (palette: Palette) => void;
  setPipeVariant: (pipeVariant: PipeVariant) => void;
  undo: () => void;
  redo: () => void;
}

export const PanelColors = ({ options, setPalette, setPipeVariant, undo, redo }: PanelColorsProps) => {
  const [isSelectPaletteShowing, setSelectPaletteShowing] = useState(false);
  const panelRef = useRef<HTMLDivElement>();

  useUndoRedo(panelRef, redo, undo);

  const renderField = (color: keyof Palette, fullWidth = false) => {
    return (
      <Field
        name={color}
        label={color}
        type="color" value={options.palette[color]}
        onChange={val => setPalette({ ...options.palette, [color]: val })}
        fullWidth={fullWidth}
      />
    );
  }

  const PIPE_VARIANT_NAME: Record<PipeVariant, string> = {
    [PipeVariant.None]: "",
    [PipeVariant.Green]: "Green",
    [PipeVariant.Orange]: "Copper",
    [PipeVariant.White]: "White",
    [PipeVariant.Cobalt]: "Cobalt",
    [PipeVariant.Flat]: "FlatSteel",
    [PipeVariant.Themed1]: "Themed1",
    [PipeVariant.Themed2]: "Themed2",
    [PipeVariant.Themed3]: "Themed3",
  };
  const toOption = (pipeVariant: PipeVariant): Option => ({
    value: String(pipeVariant),
    label: PIPE_VARIANT_NAME[pipeVariant] || 'None',
  })
  const pipeVariantOptions: Option[] = Object.values(PipeVariant).filter(v => !!v && typeof v === 'number').map(toOption);
  const handleSetPipeVariant = (option: Option) => {
    const variant = parseInt(option.value) || PipeVariant.Green;
    setPipeVariant(variant);
  }

  if (isSelectPaletteShowing) {
    return (
      <SelectPalette setPalette={setPalette} onClose={() => setSelectPaletteShowing(false)} />
    );
  }

  return (
    <div ref={panelRef}>
      <button className={styles.loadPaletteButton} onClick={() => setSelectPaletteShowing(true)}>Load Palette &gt;&gt;</button>
      <Stack row justify="start">
        {renderField('background')}
      </Stack>
      <Stack row justify="start">
        {renderField('deco1')}
        {renderField('deco1Stroke')}
      </Stack>
      <Stack row justify="start">
        {renderField('deco2')}
        {renderField('deco2Stroke')}
      </Stack>
      <Stack row justify="start">
        {renderField('barrier')}
        {renderField('barrierStroke')}
      </Stack>
      <Stack row justify="start">
        {renderField('door')}
        {renderField('doorStroke')}
      </Stack>
      <Stack row justify="start">
        {renderField('playerHead')}
      </Stack>
      <Stack row justify="start">
        {renderField('playerTail')}
        {renderField('playerTailStroke')}
      </Stack>
      <Stack row justify="start">
        {renderField('apple')}
        {renderField('appleStroke')}
      </Stack>
      <hr />
      <DropdownField
        label="Pipe Variant"
        options={pipeVariantOptions}
        value={String(options.pipeVariant)}
        defaultValue={String(PipeVariant.Green)}
        onChange={handleSetPipeVariant}
      />
    </div>
  );
}
