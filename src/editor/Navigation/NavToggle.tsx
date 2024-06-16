import React, { useState } from "react";
import cx from "classnames";

import * as styles from "./nav.css";

export const NavToggle = () => {
  const [isNavOpen, setNavOpen] = useState(false);

  return null;

  return (
    <button
      type="button"
      className={cx("hamburger hamburger--squeeze", styles.navMenuToggle, {
        ["is-active"]: isNavOpen,
      })}
      onClick={() => setNavOpen(prev => !prev)}
    >
      <span className="hamburger-box">
        <span className="hamburger-inner"></span>
      </span>
    </button>
  );
};
