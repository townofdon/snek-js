import React from "react";
import { SetStateValue } from "../editorTypes";

interface Props {
  setOptionsShowing: (val: SetStateValue<boolean>) => void,
}

export const OptionsDialogToggle = ({ setOptionsShowing }: Props) => {
  const handleClick = () => {
    setOptionsShowing(prev => !prev);
  }

  return (
    <button
      id="ui-button-settings"
      className="button ui-sprite newbutton gear"
      onClick={handleClick}
      style={{
        position: 'relative',
        bottom: 'initial',
        right: 'initial',
      }}
    >
      <span className="tooltip align-center">Options</span>
    </button>
  )
}
