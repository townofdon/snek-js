import React from "react";
import toast from "react-hot-toast";

import * as styles from './EditorOptions.css';

export const CopyLinkDev = () => {
  const copyText = () => {
    const query = new URLSearchParams(window.location.search);
    const data = query.get('data');
    navigator.clipboard.writeText(data);
    toast.success("Encoded map data copied to clipboard");
  };

  return (
    <button onClick={copyText} className={styles.copyDevLinkButton}>
      <span>
        Copy Dev Link
      </span>
    </button>
  );
};
