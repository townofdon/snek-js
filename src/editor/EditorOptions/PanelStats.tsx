import React from "react";

import { EditorOptions } from "../../types";
import { Field, FieldLabel } from "../components/Field";

interface PanelStatsProps {
  options: EditorOptions;
  setOptions: (options: EditorOptions) => void;
}

export const PanelStats = ({ options, setOptions }: PanelStatsProps) => {

  return (
    <div>
      <Field
        name="name"
        label="Map Name"
        value={options.name}
        onChange={val => setOptions(({ ...options, name: val }))}
        fullWidth
      />
      <div>
        <FieldLabel text="Apples To Clear">
          <span style={{
            display: 'flex',
            alignItems: 'stretch',
          }}>
            <Field
              name="applesToClear"
              type="number"
              value={options.applesToClear}
              onChange={val => setOptions(({ ...options, applesToClear: val }))}
            />
            <Field
              name="applesToClearSlider"
              type="range"
              value={options.applesToClear}
              onChange={val => setOptions(({ ...options, applesToClear: val }))}
              fullWidth
            />
          </span>
        </FieldLabel>
      </div>
    </div>
  );
}
