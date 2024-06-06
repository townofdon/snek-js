import React from "react";
import cx from 'classnames';

import { PortalChannel } from "../types";

import * as styles from "./Editor.css";
import { PORTAL_CHANNEL_COLORS } from "../constants";

interface SidebarPortalChannelsProps {
  activeChannel: PortalChannel,
  setChannel: (channel: PortalChannel) => void,
}

export const SidebarPortalChannels = ({ activeChannel, setChannel }: SidebarPortalChannelsProps) => {
  const renderButton = (channel: PortalChannel) => {
    const color = channel === activeChannel ? PORTAL_CHANNEL_COLORS[channel] : '#444'
    const colorPreview = channel === activeChannel ? 'rgb(17 17 17 / 10%)' : PORTAL_CHANNEL_COLORS[channel];
    return (
      <div key={channel} className={styles.portalChannelSelect}>
        <span className={styles.portalChannelColorPreview} style={{ backgroundColor: colorPreview }} />
        <button
          onClick={() => setChannel(channel)}
          className={cx(styles.portalChannel, { [styles.active]: channel === activeChannel })}
          style={{ backgroundColor: color }}
        >
          {channel + 1}
        </button>
      </div>
    );
  }
  return (
    <div>
      <label>channel</label>
      {Array.from({ length: 10 }, () => 0).map((v, i) => renderButton(i as PortalChannel))}
    </div>
  );
}
