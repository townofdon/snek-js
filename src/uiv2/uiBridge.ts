import { DEFAULT_GAME_STATE } from "@/defaults";
import { saveDataStore, SaveDataStore } from "@/stores/SaveDataStore";
import { settings } from '@/stores/SettingsStore';
import { GameSettings, GameState, InputAction, UICancelHandler, UIInteractHandler, UINavEventHandler } from "@/types";

type HandlerKey = (
  | 'mainMenu'
  | 'settingsMenu'
  | 'debugMenu'
  | 'levelSelectMenu'
  | 'gameModeMenu'
);
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
  gameState: { ...DEFAULT_GAME_STATE },
  saveDataStore: saveDataStore,
  settings: settings,
} satisfies BridgeProperties

export const bridge: Record<HandlerKey, BridgeHandler> & { callAction: CallAction | null } & BridgeProperties = {
  mainMenu: { ...DEFAULT_HANDLER},
  settingsMenu: { ...DEFAULT_HANDLER},
  debugMenu: { ...DEFAULT_HANDLER},
  levelSelectMenu: { ...DEFAULT_HANDLER},
  gameModeMenu: { ...DEFAULT_HANDLER},
  callAction: () => {},
  ...bridgeProps,
};

