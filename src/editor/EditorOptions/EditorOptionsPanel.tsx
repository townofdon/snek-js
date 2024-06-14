import React, { useCallback } from "react";
import throttle from "throttleit";

import { EditorData, EditorOptions, Level, Palette } from "../../types";
import { SetStateValue } from "../editorTypes";
import { Command, LoadLevelCommand, SetPaletteCommand } from "../commands";

import { Tabs } from "../components/Tabs/Tabs";
import { TabList } from "../components/Tabs/TabList";
import { Tab } from "../components/Tabs/Tab";
import { OptionsTab } from "../components/Tabs/tabTypes";
import { TabPanel } from "../components/Tabs/TabPanel";
import { PanelStats } from "./PanelStats";
import { PanelColors } from "./PanelColors";
import { PanelSave } from "./PanelSave";

import * as styles from './EditorOptions.css';

interface EditorOptionsPanelProps {
  isPreviewShowing: boolean;
  canvas: React.MutableRefObject<HTMLCanvasElement>;
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
  isPreviewShowing,
  canvas,
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

  const loadLevel = (level: Level) => {
    const command = new LoadLevelCommand(level, data, options, setData, setOptions);
    executeCommand(command);
  }

  return (
    <div ref={optionsContainerRef} className={styles.editorOptionsContainer}>
      <Tabs>
        <TabList>
          <Tab id={OptionsTab.Stats}>Stats</Tab>
          <Tab id={OptionsTab.Colors}>Colors</Tab>
          <Tab id={OptionsTab.Save}>Save / Load</Tab>
        </TabList>
        <TabPanel id={OptionsTab.Stats}>
          <PanelStats options={options} setOptions={setOptions} isPreviewShowing={isPreviewShowing} />
        </TabPanel>
        <TabPanel id={OptionsTab.Colors}>
          <PanelColors options={options} setPalette={setPalette} undo={undo} redo={redo} />
        </TabPanel>
        <TabPanel id={OptionsTab.Save}>
          <PanelSave canvas={canvas} data={data} options={options} loadLevel={loadLevel} undo={undo} redo={redo} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
