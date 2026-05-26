import { Initiator, InputAction } from '@/types';
import EventEmitter from 'eventemitter3';

const EE = new EventEmitter();

export const UIEvent = 'UIEvent'
export const InputActionEvent = 'InputActionEvent'

export const emitUIEvent = (action: InputAction, initiator: Initiator) => {
  EE.emit(UIEvent, action, initiator);
}

export const onUIEvent = (handler: (action: InputAction, initiator: Initiator) => void) => {
  EE.on(UIEvent, handler);
}

export const unsubscribeOnUIEvent = (handler: (action: InputAction, initiator: Initiator) => void) => {
  EE.off(UIEvent, handler);
}
