import React, { createContext, useContext, useState } from 'react';

import { OptionsTab } from './tabTypes';

interface TabsContextValue {
  tab: OptionsTab;
  setTab: (tab: OptionsTab) => void;
}

const TabContext = createContext({
  tab: OptionsTab.Stats,
  setTab: () => {},
} as TabsContextValue);

interface TabsProps {
  children: React.ReactNode;
}

export const Tabs = ({ children }: TabsProps) => {
  const [tab, setTab] = useState<OptionsTab>(OptionsTab.Stats);

  const value = {
    tab,
    setTab,
  }

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
}

export const useTabs = () => {
  return useContext(TabContext);
}
