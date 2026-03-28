import React from "react";

import * as styles from './tabs.css';

interface TabsListProps {
  children: React.ReactNode;
}

export const TabList = ({ children }: TabsListProps) => {
  return (
    <div className={styles.tabList}>
      {children}
    </div>
  );
}
