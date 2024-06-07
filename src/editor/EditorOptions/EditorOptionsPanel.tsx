import React, { useRef } from "react";

import { EditorData, EditorOptions } from "../../types";

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
  data: EditorData;
  options: EditorOptions;
  setData: (data: EditorData) => void;
  setOptions: (options: EditorOptions) => void;
  optionsContainerRef: React.MutableRefObject<HTMLDivElement>;
}

export const EditorOptionsPanel = ({ data, options, setData, setOptions, optionsContainerRef }: EditorOptionsPanelProps) => {
  return (
    <div ref={optionsContainerRef} className={styles.editorOptionsContainer}>
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
