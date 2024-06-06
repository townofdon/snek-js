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
    return (
      <button
        key={channel}
        onClick={() => setChannel(channel)}
        className={cx(styles.portalChannel, { [styles.active]: channel === activeChannel })}
        style={{ backgroundColor: color }}
      >
        {channel + 1}
      </button>
    );
  }
  return (
    <div>
      <label>channel</label>
      {Array.from({ length: 10 }, () => 0).map((v, i) => renderButton(i as PortalChannel))}
    </div>
  );
}
