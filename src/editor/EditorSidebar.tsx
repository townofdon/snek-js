import React from "react";

import * as styles from "./Editor.css";
import { Tile } from "./editorTypes";

interface EditorSidebarProps {
  tile: Tile,
  sidebarKeyChannels: React.ReactNode,
  sidebarPortalChannels: React.ReactNode,
  sidebarBarrierTypes: React.ReactNode,
  sidebarThreatTypes: React.ReactNode,
  sidebarAnnotations: React.ReactNode,
}

export const EditorSidebar = ({
  tile,
  sidebarKeyChannels,
  sidebarPortalChannels,
  sidebarBarrierTypes,
  sidebarThreatTypes,
  sidebarAnnotations,
}: EditorSidebarProps) => {

  const renderContent = () => {
    if (tile === Tile.Key || tile === Tile.Lock) {
      return sidebarKeyChannels;
    }
    if (tile === Tile.Portal) {
      return sidebarPortalChannels;
    }
    if (tile === Tile.Barrier) {
      return sidebarBarrierTypes;
    }
    if (tile === Tile.Threat) {
      return sidebarThreatTypes;
    }
    if (tile === Tile.Annotation) {
      return sidebarAnnotations;
    }
    return null;
  }

  return (
    <div className={styles.editorTileSidebar}>
      {renderContent() || <div />}
    </div>
  );
}
