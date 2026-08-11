import { SaveDataStore } from "@/stores/SaveDataStore";
import { GameSettings, GameState, InputAction, UICancelHandler, UIInteractHandler, UINavDir, UINavEventHandler } from "@/types";

type HandlerKey = 'mainMenu' | 'settingsMenu';
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

interface BridgeProperties {
  gameState: GameState
  saveDataStore: SaveDataStore
  settings: GameSettings
}

const bridgeProps: BridgeProperties = {
  gameState: null,
  saveDataStore: null,
  settings: null,
} satisfies BridgeProperties

export const bridge: Record<HandlerKey, BridgeHandler> & { callAction: CallAction | null } & BridgeProperties = {
  mainMenu: { ...DEFAULT_HANDLER},
  settingsMenu: { ...DEFAULT_HANDLER},
  callAction: () => {},
  ...bridgeProps,
};

