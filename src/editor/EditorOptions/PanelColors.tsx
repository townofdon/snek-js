import React from "react";

import { EditorOptions, Palette } from "../../types";
import { Field } from "../components/Field";

interface PanelColorsProps {
  options: EditorOptions;
  setOptions: (options: EditorOptions) => void;
}

export const PanelColors = ({ options, setOptions }: PanelColorsProps) => {

  const renderField = (color: keyof Palette) => {
    return (
      <Field
        name={color}
        label={color}
        type="color" value={options.palette[color]}
        onChange={val => setOptions({ ...options, palette: { ...options.palette, [color]: val } })}
      />
    );
  }

  return (
    <div>
      {renderField('background')}
      {renderField('playerHead')}
      {renderField('playerTail')}
      {renderField('playerTailStroke')}
      {renderField('barrier')}
      {renderField('barrierStroke')}
      {renderField('apple')}
      {renderField('appleStroke')}
      {renderField('door')}
      {renderField('doorStroke')}
      {renderField('deco1')}
      {renderField('deco1Stroke')}
      {renderField('deco2')}
      {renderField('deco2Stroke')}
    </div>
  );
}
