import React, {  } from "react";
import cx from "classnames";

import * as editorStyles from '@/editor/Editor.css';
import * as styles from './Button.css';

interface ButtonProps {
  children?: string | React.ReactNode,
  loading?: boolean,
  className?: string,
  onClick: () => void,
}

export const Button = ({ children, loading, className, onClick }: ButtonProps) => {
  return (
    <button
      className={cx(className, {
        [styles.loading]: loading,
      })}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <span className={cx(editorStyles.loader30, styles.loader)} />
      ) : (
        children
      )}
    </button>
  );
}
