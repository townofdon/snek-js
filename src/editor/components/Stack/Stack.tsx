import React from "react"
import cx from "classnames";

import * as styles from './stack.css';

enum Align {
  start = 'start',
  center = 'center',
  end = 'end',
  stretch = 'stretch',
  spaceAround = 'spaceAround',
  spaceBetween = 'spaceBetween',
}

enum Justify {
  start = 'start',
  center = 'center',
  end = 'end',
  stretch = 'stretch',
  spaceAround = 'spaceAround',
  spaceBetween = 'spaceBetween',
}

interface StackProps {
  align?: keyof typeof Align;
  justify?: keyof typeof Justify;
  row?: boolean;
  col?: boolean;
  marginBottom?: boolean;
  marginTop?: boolean;
  noChildMargin?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Stack = ({
  row,
  col,
  align = 'center',
  justify = 'start',
  marginBottom,
  marginTop,
  noChildMargin,
  className,
  style,
  children,
}: StackProps) => {
  return (
    <div
      className={cx(styles.stack, className, {
        [styles.row]: row || (!row && !col),
        [styles.col]: col,
        [styles.alignStart]: align === Align.start,
        [styles.alignEnd]: align === Align.end,
        [styles.alignStretch]: align === Align.stretch,
        [styles.alignSpaceAround]: align === Align.spaceAround,
        [styles.alignSpaceBetween]: align === Align.spaceBetween,
        [styles.justifyStart]: justify === Justify.start,
        [styles.justifyEnd]: justify === Justify.end,
        [styles.justifySpaceAround]: justify === Justify.spaceAround,
        [styles.justifySpaceBetween]: justify === Justify.spaceBetween,
        [styles.marginBottom]: marginBottom,
        [styles.marginTop]: marginTop,
        [styles.noChildMargin]: noChildMargin,
      })}
      style={style}
    >
      {children}
    </div>
  );
}
