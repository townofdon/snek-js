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

export function getStandardButtonMappingStr(button: Button): string {
  switch (button) {
    case Button.South: return 'BtnBottom';
    case Button.East: return 'BtnRight';
    case Button.West: return 'BtnLeft';
    case Button.North: return 'BtnTop';
    case Button.BumperLeft: return 'BumperLeft';
    case Button.BumperRight: return 'BumperRight';
    case Button.TriggerLeft: return 'TriggerLeft';
    case Button.TriggerRight: return 'TriggerRight';
    case Button.Select: return 'Select';
    case Button.Start: return 'Start';
    case Button.StickLeft: return 'StickLeft';
    case Button.StickRight: return 'StickRight';
    case Button.DpadUp: return 'DpadTop';
    case Button.DpadDown: return 'DpadBottom';
    case Button.DpadLeft: return 'DpadLeft';
    case Button.DpadRight: return 'DpadRight';
    case Button.XboxButton: return 'XboxButton';
    default:
      return 'Unknown button';
  }
}

export function getStandardAxisMappingStr(axis: Axis): string {
  switch (axis) {
    case Axis.LeftX: return 'XAxisLeft';
    case Axis.LeftY: return 'YAxisLeft';
    case Axis.RightX: return 'XAxisRight';
    case Axis.RightY: return 'YAxisRight';
    default:
      return 'Unknown axis'
  }
}
