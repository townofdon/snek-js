import React, { useCallback } from "react";

import { EditorData, EditorOptions, Palette } from "../../types";

import { Tabs } from "../components/Tabs/Tabs";
import { TabList } from "../components/Tabs/TabList";
import { Tab } from "../components/Tabs/Tab";
import { OptionsTab } from "../components/Tabs/tabTypes";
import { TabPanel } from "../components/Tabs/TabPanel";
import { PanelStats } from "./PanelStats";
import { PanelColors } from "./PanelColors";
import { PanelSave } from "./PanelSave";
import throttle from "throttleit";

import { Command, SetPaletteCommand } from "../commands";
import { SetStateValue } from "../editorTypes";

import * as styles from './EditorOptions.css';

interface EditorOptionsPanelProps {
  data: EditorData;
  options: EditorOptions;
  optionsRef: React.MutableRefObject<EditorOptions>;
  optionsContainerRef: React.MutableRefObject<HTMLDivElement>;
  setData: (data: EditorData) => void;
  setOptions: (value: SetStateValue<EditorOptions>) => void;
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
}

export const EditorOptionsPanel = ({
  data,
  options,
  optionsRef,
  optionsContainerRef,
  setData,
  setOptions,
  executeCommand,
  undo,
  redo,
}: EditorOptionsPanelProps) => {
  const setPalette: (palette: Palette) => void = useCallback(throttle((palette: Palette) => {
    const command = new SetPaletteCommand(palette, optionsRef, setOptions);
    executeCommand(command);
  }, 100), []);

  return (
    <div ref={optionsContainerRef} className={styles.editorOptionsContainer}>
      <Tabs>
        <TabList>
          <Tab id={OptionsTab.Stats}>Stats</Tab>
          <Tab id={OptionsTab.Colors}>Colors</Tab>
          <Tab id={OptionsTab.Save}>Save / Load</Tab>
        </TabList>
        <TabPanel id={OptionsTab.Stats}>
          <PanelStats options={options} setOptions={setOptions} />
        </TabPanel>
        <TabPanel id={OptionsTab.Colors}>
          <PanelColors options={options} setPalette={setPalette} undo={undo} redo={redo} />
        </TabPanel>
        <TabPanel id={OptionsTab.Save}>
          <PanelSave data={data} options={options} setData={setData} setOptions={setOptions} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
