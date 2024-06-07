import React from "react";

import { EditorData, EditorOptions as EditorOptionsType } from "../../types";

import * as styles from './EditorOptions.css';
import { Tabs } from "../components/Tabs/Tabs";
import { TabList } from "../components/Tabs/TabList";
import { Tab } from "../components/Tabs/Tab";
import { OptionsTab } from "../components/Tabs/tabTypes";
import { TabPanel } from "../components/Tabs/TabPanel";
import { PanelStats } from "./PanelStats";
import { PanelColors } from "./PanelColors";
import { PanelSave } from "./PanelSave";

interface EditorOptionsProps {
  data: EditorData;
  options: EditorOptionsType;
  setData: (data: EditorData) => void;
  setOptions: (options: EditorOptionsType) => void;
}

export const EditorOptions = ({ data, options, setData, setOptions }: EditorOptionsProps) => {
  const handleKeyDown = (ev: React.KeyboardEvent) => {
    ev.stopPropagation();
  }

  return (
    <div className={styles.editorOptionsContainer} onKeyDown={handleKeyDown}>
      <Tabs>
        <TabList>
          <Tab id={OptionsTab.Stats}>Stats</Tab>
          <Tab id={OptionsTab.Colors}>Colors</Tab>
          <Tab id={OptionsTab.Save}>Import / Export</Tab>
        </TabList>
        <TabPanel id={OptionsTab.Stats}>
          <PanelStats options={options} setOptions={setOptions} />
        </TabPanel>
        <TabPanel id={OptionsTab.Colors}>
          <PanelColors options={options} setOptions={setOptions} />
        </TabPanel>
        <TabPanel id={OptionsTab.Save}>
          <PanelSave data={data} options={options} setOptions={setOptions} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
