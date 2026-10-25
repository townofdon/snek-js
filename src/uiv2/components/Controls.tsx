import React from "react";
import { Stack } from "@/components/Stack";
import { GamepadType, getGamepadType } from "@/engine/gamepad";
import { InputType } from "@/types";

interface ControlsProps {
  inputType: InputType,
  label?: string,
  style?: React.CSSProperties,
}

const ButtonBack = ({ inputType, label, style }: ControlsProps) => {
  const gamepadType = getGamepadType();
  if (inputType === InputType.Keyboard) {
    return (
      <Stack row style={style}>
        <span className="controls-key escape position-absolute" style={{ right: '100%' }} />
        <p className="minimood">{label || 'Back'}</p>
      </Stack>
    );
  }
  return (
    <Stack row style={style}>
      {(gamepadType === GamepadType.Xbox) && (
        <span className="controls-button xbox-b position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      {(gamepadType === GamepadType.Playstation) && (
        <span className="controls-button ps-o position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      {(gamepadType === GamepadType.Nintendo) && (
        <span className="controls-button switch-a position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      <p className="minimood">{label || 'Back'}</p>
    </Stack>
  )
}

const ButtonSelect = ({ inputType, label, style }: ControlsProps) => {
  const gamepadType = getGamepadType();
  if (inputType === InputType.Keyboard) {
    return (
      <Stack style={style}>
        <span className="controls-key return position-absolute" style={{ right: '100%' }} />
        <p className="minimood">{label || 'Select'}</p>
      </Stack>
    );
  }
  return (
    <Stack row style={style}>
      {(gamepadType === GamepadType.Xbox) && (
        <span className="controls-button xbox-a position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      {gamepadType === GamepadType.Playstation && (
        <span className="controls-button ps-x position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      {gamepadType === GamepadType.Nintendo && (
        <span className="controls-button switch-b position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      <p className="minimood">{label || 'Select'}</p>
    </Stack>
  )
}

const ButtonRight = ({ inputType, label, style }: ControlsProps) => {
  if (inputType === InputType.Keyboard) {
    return (
      <Stack style={style}>
        <span className="controls-key right return position-absolute" style={{ right: '100%' }} />
        <p className="minimood">{label || 'Navigate'}</p>
      </Stack>
    );
  }
  return (
    <Stack row style={style}>
      <span className="controls-dpad right position-absolute" style={{ right: '100%', marginTop: -2, marginRight: 0 }} />
      <p className="minimood">{label || 'Navigate'}</p>
    </Stack>
  )
}

export const Controls = {
  ButtonBack,
  ButtonSelect,
  ButtonRight,
};
