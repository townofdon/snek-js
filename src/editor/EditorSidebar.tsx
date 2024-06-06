import React from "react";

import * as styles from "./Editor.css";
import { Tile } from "./editorTypes";

interface EditorSidebarProps {
  tile: Tile,
  sidebarKeyChannels: React.ReactNode,
  sidebarPortalChannels: React.ReactNode,
}

export const EditorSidebar = ({
  tile,
  sidebarKeyChannels,
  sidebarPortalChannels,
}: EditorSidebarProps) => {

  const renderContent = () => {
    if (tile === Tile.Key || tile === Tile.Lock) {
      return sidebarKeyChannels;
    }
    if (tile === Tile.Portal) {
      return sidebarPortalChannels;
    }
    return null;
  }

  return (
    <div className={styles.editorTileSidebar}>
      {renderContent() || <div />}
    </div>
  );
}
