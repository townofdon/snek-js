
import P5 from 'p5';
import {
  GameSettings,
  GameState,
  Initiator,
  UICancelHandler,
  UIHandler,
  UIInteractHandler,
  UINavDir,
  UINavEventHandler,
} from '../types';
import { InputAction } from '../types';
import {
  GameOverMenuElement,
  GameOverMenuNavMap,
  PauseMenuElement,
  PauseMenuNavMap,
} from './uiNavMap';
import { UI } from './ui';
import { unsubscribeOnUIEvent, onUIEvent, emitUIEvent } from './uiEvents';
import { bridge } from '@/uiv2/uiBridge';
import { SaveDataStore } from '@/stores/SaveDataStore';

export class UIBindings implements UIHandler {
  private p5: P5;
  private gameState: GameState;
  private callAction: (action: InputAction, p0?: any) => void;
  private callPauseMenuAction = (element: PauseMenuElement) => {
    switch (element) {
      case PauseMenuElement.ButtonResume:
        this.callAction(InputAction.UnPause);
        break;
      case PauseMenuElement.ButtonMainMenu:
        this.callAction(InputAction.ConfirmGotoMainMenu);
        break;
      case PauseMenuElement.ButtonSettings:
        this.callAction(InputAction.ShowSettingsMenu);
        break;
    }
  }
  private callGameOverMenuAction = (element: GameOverMenuElement) => {
    switch (element) {
      case GameOverMenuElement.ButtonTryAgain:
        this.callAction(InputAction.RetryLevel);
        break;
      case GameOverMenuElement.ButtonMainMenu:
        this.callAction(InputAction.ConfirmGotoMainMenu);
        break;
    }
  }

  private pauseMenuNavMap: PauseMenuNavMap;
  private gameOverMenuNavMap: GameOverMenuNavMap;

  constructor(p5: P5, gameState: GameState, settings: GameSettings, saveDataStore: SaveDataStore, callAction: (action: InputAction, p0?: any) => void) {
    this.p5 = p5;
    this.gameState = gameState;
    this.callAction = callAction;
    bridge.callAction = callAction;
    bridge.gameState = gameState;
    bridge.settings = settings;
    bridge.saveDataStore = saveDataStore;
    this.pauseMenuNavMap = new PauseMenuNavMap(this.callPauseMenuAction);
    this.gameOverMenuNavMap = new GameOverMenuNavMap(this.callGameOverMenuAction);
    onUIEvent(this.handleUIEvent);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  handleUINavigation: UINavEventHandler = (navDir) => {
    if (UI.getIsLevelSelectMenuShowing()) {
      return bridge.levelSelectMenu?.onNavigate?.(navDir) || false;
    }
    if (UI.getIsSettingsMenuShowing()) {
      return bridge.settingsMenu?.onNavigate?.(navDir) || false;
    }
    if (UI.getIsMainMenuShowing()) {
      return bridge.mainMenu?.onNavigate?.(navDir) || false;
    }
    if (UI.getIsGameModeMenuShowing()) {
      return bridge.gameModeMenu?.onNavigate?.(navDir) || false;
    }
    if (this.gameState.isLost) {
      switch (navDir) {
        case UINavDir.Prev:
          return this.gameOverMenuNavMap.gotoPrev();
        case UINavDir.Next:
          return this.gameOverMenuNavMap.gotoNext();
        case UINavDir.Up:
          return this.gameOverMenuNavMap.gotoUp();
        case UINavDir.Down:
          return this.gameOverMenuNavMap.gotoDown();
        case UINavDir.Left:
          return this.gameOverMenuNavMap.gotoLeft();
        case UINavDir.Right:
          return this.gameOverMenuNavMap.gotoRight();
        default:
          return false;
      }
    }
    if (this.gameState.isPaused) {
      if (bridge.debugMenu.onNavigate?.(navDir)) {
        return true;
      }
      switch (navDir) {
        case UINavDir.Prev:
          this.pauseMenuNavMap.gotoPrev();
          break;
        case UINavDir.Next:
          this.pauseMenuNavMap.gotoNext();
          break;
        case UINavDir.Up:
          this.pauseMenuNavMap.gotoUp();
          break;
        case UINavDir.Down:
          this.pauseMenuNavMap.gotoDown();
          break;
        case UINavDir.Left:
          this.pauseMenuNavMap.gotoLeft();
          break;
        case UINavDir.Right:
          this.pauseMenuNavMap.gotoRight();
          break;
      }
      return true;
    }
    return false;
  }

  handleUIInteract: UIInteractHandler = () => {
    if (UI.getIsLevelSelectMenuShowing()) {
      return bridge.levelSelectMenu?.onInteract?.() || false;
    }
    if (UI.getIsSettingsMenuShowing()) {
      return bridge.settingsMenu?.onInteract?.() || false;
    }
    if (UI.getIsMainMenuShowing()) {
      return bridge.mainMenu?.onInteract?.() || false;
    }
    if (UI.getIsGameModeMenuShowing()) {
      return bridge.gameModeMenu?.onInteract?.() || false;
    }
    if (this.gameState.isLost) {
      return this.gameOverMenuNavMap.callSelected();
    }
    if (this.gameState.isPaused) {
      if (bridge.debugMenu.onInteract?.()) {
        return true;
      }
      return this.pauseMenuNavMap.callSelected();
    }
    return false;
  }

  handleUICancel: UICancelHandler = () => {
    if (UI.getIsLevelSelectMenuShowing()) {
      return bridge.levelSelectMenu?.onCancel?.() || false;
    }
    if (UI.getIsSettingsMenuShowing()) {
      return bridge.settingsMenu?.onCancel?.() || false;
    }
    if (UI.getIsGameModeMenuShowing()) {
      return bridge.gameModeMenu?.onCancel?.() || false;
    }
    if (this.gameState.isPaused) {
      if (bridge.debugMenu.onCancel?.()) {
        return true;
      }
      this.callAction(InputAction.UnPause);
      return true;
    }
    return false;
  }

  onPause = () => {
    if (this.gameState.isPaused && !UI.getIsSettingsMenuShowing() && !UI.getIsMainMenuShowing()) {
      this.pauseMenuNavMap.gotoFirst();
    }
  }

  onPauseCancelModal = () => {
    if (this.gameState.isPaused && !UI.getIsSettingsMenuShowing() && !UI.getIsMainMenuShowing()) {
      this.pauseMenuNavMap.gotoCurrent();
    }
  }

  onGameOver = () => {
    if (this.gameState.isLost && !UI.getIsSettingsMenuShowing() && !UI.getIsMainMenuShowing()) {
      this.gameOverMenuNavMap.gotoFirst();
    }
  }

  onGameOverCancelModal = () => {
    if (this.gameState.isLost && !UI.getIsSettingsMenuShowing() && !UI.getIsMainMenuShowing()) {
      this.gameOverMenuNavMap.gotoCurrent();
    }
  }

  refreshFieldValues() {
    emitUIEvent(InputAction.ForceRerender, Initiator.UI);
  }

  private handleUIEvent = (action: InputAction = InputAction.None) => {
    // silence is golden
  }

  public cleanup = () => {
    unsubscribeOnUIEvent(this.handleUIEvent);
    // this.handleUIEvent(InputAction.Cleanup);
    // document.removeEventListener('keydown', this.overrideEscapeKeydown);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  public setStartButtonVisibility = (visible: boolean, levelId: string) => {
    const { isRandomizer } = this.gameState;
    if (visible) {
      emitUIEvent(InputAction.ButtonBlinkOn, Initiator.UI);
    } else {
      emitUIEvent(InputAction.ButtonBlinkOff, Initiator.UI);
    }
  }

  // private overrideEscapeKeydown = (event: KeyboardEvent) => {
  //   if (!this.gameState.isGameStarted) return;
  //   if (this.gameState.isGameWon) return;
  //   if (event.keyCode === this.p5.ESCAPE || event.code === 'Escape') {
  //     event.preventDefault();
  //   }
  // }

  private handleWindowBlur = () => {
    this.p5.deltaTime = 0;
    this.callAction(InputAction.Pause);
  }
}
