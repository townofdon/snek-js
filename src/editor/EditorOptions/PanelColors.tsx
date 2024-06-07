import React, { useState } from "react";

import { EditorOptions, Palette } from "../../types";
import { Field } from "../components/Field";
import { Stack } from "../components/Stack";
import { SelectPalette } from "./SelectPalette";

import * as styles from './EditorOptions.css';
interface PanelColorsProps {
  options: EditorOptions;
  setOptions: (options: EditorOptions) => void;
}

export const PanelColors = ({ options, setOptions }: PanelColorsProps) => {
  const [isSelectPaletteShowing, setSelectPaletteShowing] = useState(false);

  const renderField = (color: keyof Palette, fullWidth = false) => {
    return (
      <Field
        name={color}
        label={color}
        type="color" value={options.palette[color]}
        onChange={val => setOptions({ ...options, palette: { ...options.palette, [color]: val } })}
        fullWidth={fullWidth}
      />
    );
  }

  if (isSelectPaletteShowing) {
    return (
      <SelectPalette options={options} setOptions={setOptions} onClose={() => setSelectPaletteShowing(false)} />
    );
  }

  return (
    <div>
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
    </div>
  );
}
