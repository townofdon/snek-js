import React from "react";
import cx from 'classnames';

import { KeyChannel } from "../types";

import * as styles from "./Editor.css";

interface SidebarKeyChannelsProps {
  activeChannel: KeyChannel,
  setChannel: (channel: KeyChannel) => void,
}

export const SidebarKeyChannels = ({ activeChannel, setChannel }: SidebarKeyChannelsProps) => {
  const renderButton = (channel: KeyChannel) => {
    const text = {
      [KeyChannel.Yellow]: 1,
      [KeyChannel.Red]: 2,
      [KeyChannel.Blue]: 3,
    }[channel];
    const className = {
      [KeyChannel.Yellow]: styles.keyChannelYellow,
      [KeyChannel.Red]: styles.keyChannelRed,
      [KeyChannel.Blue]: styles.keyChannelBlue,
    }[channel]
    return (
      <div className={cx(className, styles.keyChannelSelect, { [styles.active]: channel === activeChannel })}>
        <span className={styles.keyChannelColorPreview} />
        <button
          onClick={() => setChannel(channel)}
        >
          {text}
        </button>
      </div>
    );
  }
  return (
    <div>
      <label>channel</label>
      {renderButton(KeyChannel.Yellow)}
      {renderButton(KeyChannel.Red)}
      {renderButton(KeyChannel.Blue)}
    </div>
  );
}
