import React from "react";

interface SlotProps {
  id: string,
  slotRef: React.MutableRefObject<HTMLButtonElement>,
  selected?: boolean,
  focused?: boolean,
  blink?: boolean,
  className?: string,
  children: React.ReactNode,
  onClick: () => void,
}
export const Slot = ({
  id,
  slotRef,
  selected,
  focused,
  blink,
  className,
  children,
  onClick,
}: SlotProps) => {
  return (
    <button
      tabIndex={0}
      id={id}
      ref={slotRef}
      className={"slot minimood"
        + (focused ? " focused ui-arrows" : "")
        + (blink ? " invisible" : "")
        + (selected ? " selected active" : "")
        + (className ? ` ${className}` : "")
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface SlotContainerProps {
  children: React.ReactNode,
};
export const SlotContainer = ({ children }: SlotContainerProps) => {
  return (
    <div className="selectable-slots">
      {children}
    </div>
  )
};
