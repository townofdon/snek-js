import React from "react";
import { Stack } from "@/components/Stack";
import { GamepadType, getGamepadType } from "@/engine/gamepad";
import { InputType } from "@/types";

interface ControlsProps {
  inputType: InputType,
}

const ButtonBack = ({ inputType }: ControlsProps) => {
  const gamepadType = getGamepadType();
  if (inputType === InputType.Keyboard) {
    return (
      <Stack row>
        <span className="controls-key escape position-absolute" style={{ right: '100%' }} />
        <p className="minimood">Back</p>
      </Stack>
    );
  }
  return (
    <Stack row>
      {(gamepadType === GamepadType.Xbox) && (
        <span className="controls-button xbox-b position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      {(gamepadType === GamepadType.Playstation) && (
        <span className="controls-button ps-o position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      {(gamepadType === GamepadType.Nintendo) && (
        <span className="controls-button switch-a position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      <p className="minimood">Back</p>
    </Stack>
  )
}

const ButtonSelect = ({ inputType }: ControlsProps) => {
  const gamepadType = getGamepadType();
  if (inputType === InputType.Keyboard) {
    return (
      <Stack>
        <span className="controls-key return position-absolute" style={{ right: '100%' }} />
        <p className="minimood">Select</p>
      </Stack>
    );
  }
  return (
    <Stack row>
      {(gamepadType === GamepadType.Xbox) && (
        <span className="controls-button xbox-a position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      {gamepadType === GamepadType.Playstation && (
        <span className="controls-button ps-x position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      {gamepadType === GamepadType.Nintendo && (
        <span className="controls-button switch-b position-absolute" style={{ right: '100%', marginRight: 10 }} />
      )}
      <p className="minimood">Select</p>
    </Stack>
  )
}

export const Controls = {
  ButtonBack,
  ButtonSelect,
};
