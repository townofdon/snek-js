import EventEmitter from 'eventemitter3';

const EE = new EventEmitter();

export const UIEvent = 'UIEvent'

export enum UIAction {
  None,
  Cleanup,
  ShowMainMenu,
  HideMainMenu,
  ShowSettingsMenu,
  HideSettingsMenu,
  ShowGameModeMenu,
  HideGameModeMenu,
  ShowLevelSelectMenu,
  HideLevelSelectMenu,
}

export const emitUIEvent = (action: UIAction) => {
  EE.emit(UIEvent, action)
}

export const onUIEvent = (handler: (action: UIAction) => void) => {
  EE.on(UIEvent, handler)
}

export const offUIEvent = (handler: (action: UIAction) => void) => {
  EE.off(UIEvent, handler);
}
