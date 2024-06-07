import React from "react";

import { OptionsTab } from "./tabTypes";
import { useTabs } from "./Tabs";

import * as styles from './tabs.css';

interface TabPanelProps {
  id: OptionsTab;
  children: React.ReactNode;
}

export const TabPanel = ({ id, children }: TabPanelProps) => {
  const { tab } = useTabs();
  if (tab !== id) return null;
  return (
    <div className={styles.tabPanel}>
      {children}
    </div>
  );
}
