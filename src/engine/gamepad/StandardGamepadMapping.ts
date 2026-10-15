import { Axis, Button } from "./gamepadTypes";

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
