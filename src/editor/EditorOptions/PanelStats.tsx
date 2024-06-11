import React from "react";

import { EditorOptions } from "../../types";
import { Field, FieldLabel } from "../components/Field";
import { SliderWithInput } from "../components/Field/SliderWithInput";

interface PanelStatsProps {
  options: EditorOptions;
  setOptions: (options: EditorOptions) => void;
}

export const PanelStats = ({ options, setOptions }: PanelStatsProps) => {

  return (
    <div>
      <Field
        label="Map Name"
        name="name"
        value={options.name}
        onChange={val => setOptions(({ ...options, name: val }))}
        fullWidth
      />
      <Field
        label="Disable apple spawn"
        name="disableAppleSpawn"
        type="checkbox"
        value={options.disableAppleSpawn}
        onChange={val => setOptions({ ...options, disableAppleSpawn: val })}
      />
      {!options.disableAppleSpawn && (
        <SliderWithInput
          label="Num apples at start"
          name="numApplesStart"
          value={options.numApplesStart}
          onChange={val => setOptions(({ ...options, numApplesStart: val }))}
          min={0}
          max={50}
        />
      )}
      <SliderWithInput
        label="Apples to clear"
        name="applesToClear"
        value={options.applesToClear}
        onChange={val => setOptions(({ ...options, applesToClear: val }))}
        min={0}
        max={200}
      />
      <SliderWithInput
        label="Time to clear (s)"
        name="timeToClear"
        value={options.timeToClear}
        onChange={val => setOptions(({ ...options, timeToClear: val }))}
        min={1}
        max={5 * 60 * 1000}
      />
      <SliderWithInput
        label="Start snek size"
        name="snakeStartSize"
        value={options.snakeStartSize}
        onChange={val => setOptions(({ ...options, snakeStartSize: val }))}
        min={3}
        max={100}
      />
      <SliderWithInput
        label="Global Light"
        name="globalLight"
        value={options.globalLight}
        onChange={val => setOptions(({ ...options, globalLight: val }))}
        min={0}
        max={1}
        step={0.01}
      />
    </div>
  );
}
