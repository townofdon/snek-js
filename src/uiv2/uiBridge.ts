import { DEFAULT_GAME_STATE } from "@/defaults";
import { saveDataStore, SaveDataStore } from "@/stores/SaveDataStore";
import { settings } from '@/stores/SettingsStore';
import { CallAction, GameSettings, GameState, UICancelHandler, UIInteractHandler, UINavEventHandler } from "@/types";

type HandlerKey = (
  | 'titleScreen'
  | 'settingsMenu'
  | 'debugMenu'
  | 'levelSelectMenu'
  | 'gameModeMenu'
  | 'saveSlotMenu'
);

interface BridgeHandler {
  onNavigate: UINavEventHandler | null,
  onInteract: UIInteractHandler | null,
  onCancel: UICancelHandler | null,
  showing: boolean,
}

const DEFAULT_HANDLER: BridgeHandler = {
  onNavigate: null,
  onInteract: null,
  onCancel: null,
  showing: false,
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
  titleScreen: { ...DEFAULT_HANDLER},
  settingsMenu: { ...DEFAULT_HANDLER},
  debugMenu: { ...DEFAULT_HANDLER},
  levelSelectMenu: { ...DEFAULT_HANDLER},
  gameModeMenu: { ...DEFAULT_HANDLER},
  saveSlotMenu: { ...DEFAULT_HANDLER},
  callAction: () => {},
  ...bridgeProps,
};

