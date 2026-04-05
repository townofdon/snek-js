import { Stack } from "@/components/Stack";
import React from "react";
import { TesterOptions } from "./testerTypes";
import { SetStateValue } from "@/editor/editorTypes";
import { DropdownField, Option, SliderWithInput, ToggleField } from "@/components/Field";
import { MAX_NUM_PREY } from "@/collections/preyList";
import { PreyType } from "@/types";
import { readablePreyType, toPreyType } from "@/utils";

interface TesterOptionalPanelProps {
  options: TesterOptions,
  setOptions: (value: SetStateValue<TesterOptions>) => void
  handleGenerateMap: () => void
}

export const TesterOptionsPanel = ({ options, setOptions, handleGenerateMap }: TesterOptionalPanelProps) => {
  const agentTypeOptions = [
    PreyType.Grub,
    PreyType.FieldMouse,
    PreyType.Ant,
    PreyType.Grasshopper,
  ].map(num => ({
    id: String(num),
    value: String(num),
    label: readablePreyType(num),
  } satisfies Option));

  const handleNumAgentsChange = (selected: Option) => {
    setOptions(prev => ({ ...prev, preyType: toPreyType(parseInt(selected.value, 10)) }));
  }

  return (
    <Stack col align="start" justify="start">
      <h3>Options</h3>
      <SliderWithInput
        label="Num Agents"
        name="numAgents"
        value={options.numAgents}
        onChange={(val) => setOptions({ ...options, numAgents: parseInt(String(val), 10) })}
        min={1}
        max={MAX_NUM_PREY}
      />
      <DropdownField
        label="Agent Type"
        options={agentTypeOptions}
        value={String(options.preyType)}
        onChange={handleNumAgentsChange}
      />
      <hr />
      <h3>Autogen Map</h3>
      <ToggleField
        label="Set Player Position"
        name="genPlayerPosition"
        checked={options.genPlayerPosition}
        onChange={(val) => setOptions({ ...options, genPlayerPosition: val })}
      />
      <ToggleField
        label="Wall Border"
        name="wallBorder"
        checked={options.genWallBorder}
        onChange={(val) => setOptions({ ...options, genWallBorder: val })}
      />
      <SliderWithInput
        label="Fill Walls"
        name="genWallPercentage"
        value={options.genWallPercentage}
        onChange={(val) => setOptions({ ...options, genWallPercentage: parseFloat(String(val)) })}
        min={0}
        max={0.3}
        step={0.025}
      />
      <SliderWithInput
        label="Fill Mines"
        name="genMinePercentage"
        value={options.genMinePercentage}
        onChange={(val) => setOptions({ ...options, genMinePercentage: parseFloat(String(val)) })}
        min={0}
        max={0.3}
        step={0.025}
      />
      <button onClick={handleGenerateMap}>Generate</button>
    </Stack>
  );
};
