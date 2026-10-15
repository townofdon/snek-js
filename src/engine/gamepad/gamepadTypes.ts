export enum GamepadType {
  None = 0,
  Xbox,
  Playstation,
  Nintendo,
}

export enum Button {
  South = 0,
  East = 1,
  West = 2,
  North = 3,
  BumperLeft = 4,
  BumperRight = 5,
  TriggerLeft = 6,
  TriggerRight = 7,
  Select = 8, // select
  Start = 9, // start
  StickLeft = 10,
  StickRight = 11,
  DpadUp = 12,
  DpadDown = 13,
  DpadLeft = 14,
  DpadRight = 15,
  XboxButton = 16, // xbox button
}

export enum Axis {
  /**
   * (negative left/positive right)
   */
  LeftX = 0,
  /**
   * (negative up/positive down)
   */
  LeftY = 1,
  /**
   * (negative left/positive right)
   */
  RightX = 2,
  /**
   * (negative up/positive down)
   */
  RightY = 3,
}