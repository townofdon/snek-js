import { DEFAULT_ENGINE_STATE, DEFAULT_GAME_STATE, DEFAULT_OUTFIT } from "@/defaults";
import { saveDataStore, SaveDataStore } from "@/stores/SaveDataStore";
import { settings } from '@/stores/SettingsStore';
import { CallAction, EngineState, GameSettings, GameState, Outfit, UICancelHandler, UIInteractHandler, UINavEventHandler } from "@/types";

type HandlerKey = (
  | 'titleScreen'
  | 'settingsMenu'
  | 'debugMenu'
  | 'levelSelectMenu'
  | 'mainMenu'
  | 'saveSlotMenu'
  | 'gameModeMenu'
  | 'wearablesMenu'
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
  es: EngineState,
  gameState: GameState,
  outfit: Outfit,
  saveDataStore: SaveDataStore,
  settings: GameSettings,
}

const bridgeProps: BridgeProperties = {
  es: { ...DEFAULT_ENGINE_STATE },
  gameState: { ...DEFAULT_GAME_STATE },
  outfit: { ...DEFAULT_OUTFIT },
  saveDataStore: saveDataStore,
  settings: settings,
} satisfies BridgeProperties

export const bridge: Record<HandlerKey, BridgeHandler> & { callAction: CallAction | null } & BridgeProperties = {
  titleScreen: { ...DEFAULT_HANDLER},
  settingsMenu: { ...DEFAULT_HANDLER},
  debugMenu: { ...DEFAULT_HANDLER},
  levelSelectMenu: { ...DEFAULT_HANDLER},
  mainMenu: { ...DEFAULT_HANDLER},
  saveSlotMenu: { ...DEFAULT_HANDLER},
  gameModeMenu: { ...DEFAULT_HANDLER},
  wearablesMenu: { ...DEFAULT_HANDLER},
  callAction: () => {},
  ...bridgeProps,
};

