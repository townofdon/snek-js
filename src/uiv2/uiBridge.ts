import { InputAction, UICancelHandler, UIInteractHandler, UINavDir, UINavEventHandler } from "@/types";

type HandlerKey = 'mainMenu' | 'settings';
type CallAction = (action: InputAction, p0?: any) => void

interface BridgeHandler {
  onNavigate: UINavEventHandler | null,
  onInteract: UIInteractHandler | null,
  onCancel: UICancelHandler | null,
}

const DEFAULT_HANDLER: BridgeHandler = {
  onNavigate: null,
  onInteract: null,
  onCancel: null,
}

export const bridge: Record<HandlerKey, BridgeHandler> & { callAction: CallAction | null } = {
  mainMenu: { ...DEFAULT_HANDLER},
  settings: { ...DEFAULT_HANDLER},
  callAction: () => {},
};

