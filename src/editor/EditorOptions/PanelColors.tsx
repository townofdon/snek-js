import React from "react";

import { EditorOptions, Palette } from "../../types";
import { Field } from "../components/Field";
import { Stack } from "../components/Stack";

interface PanelColorsProps {
  options: EditorOptions;
  setOptions: (options: EditorOptions) => void;
}

export const PanelColors = ({ options, setOptions }: PanelColorsProps) => {

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

  return (
    <div>
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
