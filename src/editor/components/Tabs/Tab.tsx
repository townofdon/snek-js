import React from "react";
import cx from "classnames";

import { OptionsTab } from "./tabTypes";
import { useTabs } from "./Tabs";

import * as styles from './tabs.css';

export interface TabProps {
  id: OptionsTab;
  children: React.ReactNode;
}

export const Tab = ({ id, children }: TabProps) => {
  const { tab, setTab } = useTabs();
  return (
    <button
      className={cx(styles.tab, { [styles.active]: tab === id })}
      onClick={() => {
        setTab(id);
      }}
    >
      {children}
    </button>
  );
}
