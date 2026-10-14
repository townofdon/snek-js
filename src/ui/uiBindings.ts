
import P5 from 'p5';
import {
  GameMode,
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
  GameModeMenuNavMap,
  GameOverMenuElement,
  GameOverMenuNavMap,
  PauseMenuElement,
  PauseMenuNavMap,
} from './uiNavMap';
import { UI } from './ui';
import { parseElementLevelNum, requireElementById } from './uiUtils';
import { unsubscribeOnUIEvent, onUIEvent, emitUIEvent } from './uiEvents';
import { START_CHALLENGE_LEVEL_ID } from '../levels/levelUtils';
import { GameModeMenuElement } from './uiTypes';
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
  private callGameModeMenuAction = (element: GameModeMenuElement) => {
    switch (element) {
      case GameModeMenuElement.Campaign:
        this.callAction(InputAction.StartGame);
        break;
      case GameModeMenuElement.Challenge:
        this.callAction(InputAction.StartGame, START_CHALLENGE_LEVEL_ID);
        break;
      case GameModeMenuElement.LevelSelect:
        this.callAction(InputAction.ShowLevelSelectMenu);
        break;
      case GameModeMenuElement.Randomizer:
        this.onSelectGameModeRandomizer();
        break;
      case GameModeMenuElement.Back:
        this.callAction(InputAction.HideGameModeMenu);
        break;
    }
  }

  private callLevelSelectMenuAction = (id: string) => {
    const elem = document.getElementById(id);
    if (!elem) {
      console.warn(`could not find element with id '${id}'`)
      return;
    }
    elem.click();
  }

  private main: HTMLElement;
  private pauseMenuNavMap: PauseMenuNavMap;
  private gameOverMenuNavMap: GameOverMenuNavMap;
  private gameModeMenuNavMap: GameModeMenuNavMap;
  private gameModeMenuElements: Record<GameModeMenuElement, HTMLButtonElement> = {
    [GameModeMenuElement.Campaign]: undefined,
    [GameModeMenuElement.Challenge]: undefined,
    [GameModeMenuElement.LevelSelect]: undefined,
    [GameModeMenuElement.Randomizer]: undefined,
    [GameModeMenuElement.Back]: undefined
  }

  constructor(p5: P5, gameState: GameState, settings: GameSettings, saveDataStore: SaveDataStore, callAction: (action: InputAction, p0?: any) => void) {
    this.p5 = p5;
    this.gameState = gameState;
    this.callAction = callAction;
    bridge.callAction = callAction;
    bridge.gameState = gameState;
    bridge.settings = settings;
    bridge.saveDataStore = saveDataStore;
    this.assignElements();
    this.pauseMenuNavMap = new PauseMenuNavMap(this.callPauseMenuAction);
    this.gameOverMenuNavMap = new GameOverMenuNavMap(this.callGameOverMenuAction);
    this.gameModeMenuNavMap = new GameModeMenuNavMap(this.callGameModeMenuAction);
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
      switch (navDir) {
        case UINavDir.Prev:
        case UINavDir.Up:
        case UINavDir.Left:
          this.gameModeMenuNavMap.gotoPrev();
          break;
        case UINavDir.Next:
        case UINavDir.Down:
        case UINavDir.Right:
          this.gameModeMenuNavMap.gotoNext();
          break;
      }
      return true;
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
      return this.gameModeMenuNavMap.callSelected();
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
      this.callAction(InputAction.HideGameModeMenu);
      return true;
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

  onSelectGameMode = () => {
    if (UI.getIsGameModeMenuShowing()) {
      this.gameModeMenuNavMap.gotoFirst();
    }
  }

  refreshFieldValues() {
    if (this.gameState.gameMode === GameMode.Cobra) {
      this.gameModeMenuElements[GameModeMenuElement.LevelSelect].classList.add('hidden');
    } else {
      this.gameModeMenuElements[GameModeMenuElement.LevelSelect].classList.remove('hidden');
    }
    emitUIEvent(InputAction.ForceRerender, Initiator.UI);
  }

  private assignElements = () => {
    this.main = requireElementById<HTMLElement>('main');

    this.gameModeMenuElements[GameModeMenuElement.Campaign] = requireElementById<HTMLButtonElement>(GameModeMenuElement.Campaign);
    this.gameModeMenuElements[GameModeMenuElement.Challenge] = requireElementById<HTMLButtonElement>(GameModeMenuElement.Challenge);
    this.gameModeMenuElements[GameModeMenuElement.LevelSelect] = requireElementById<HTMLButtonElement>(GameModeMenuElement.LevelSelect);
    this.gameModeMenuElements[GameModeMenuElement.Randomizer] = requireElementById<HTMLButtonElement>(GameModeMenuElement.Randomizer);
    this.gameModeMenuElements[GameModeMenuElement.Back] = requireElementById<HTMLButtonElement>(GameModeMenuElement.Back);
  }

  private handleUIEvent = (action: InputAction = InputAction.None) => {
      const cleanup = false;
      if (action === InputAction.ShowGameModeMenu) {
        this.gameModeMenuElements[GameModeMenuElement.Campaign].addEventListener('click', this.onSelectGameModeCampaign);
        this.gameModeMenuElements[GameModeMenuElement.Challenge].addEventListener('click', this.onSelectGameModeChallenge);
        this.gameModeMenuElements[GameModeMenuElement.LevelSelect].addEventListener('click', this.onSelectGameModeLevelSelect);
        this.gameModeMenuElements[GameModeMenuElement.Randomizer].addEventListener('click', this.onSelectGameModeRandomizer);
        this.gameModeMenuElements[GameModeMenuElement.Back].addEventListener('click', this.onSelectGameModeBack);
      }
      if (cleanup || action === InputAction.HideGameModeMenu) {
        this.gameModeMenuElements[GameModeMenuElement.Campaign].removeEventListener('click', this.onSelectGameModeCampaign);
        this.gameModeMenuElements[GameModeMenuElement.Challenge].removeEventListener('click', this.onSelectGameModeChallenge);
        this.gameModeMenuElements[GameModeMenuElement.LevelSelect].removeEventListener('click', this.onSelectGameModeLevelSelect);
        this.gameModeMenuElements[GameModeMenuElement.Randomizer].removeEventListener('click', this.onSelectGameModeRandomizer);
        this.gameModeMenuElements[GameModeMenuElement.Back].removeEventListener('click', this.onSelectGameModeBack);
      }
  }

  public cleanup = () => {
    unsubscribeOnUIEvent(this.handleUIEvent);
    // this.handleUIEvent(InputAction.Cleanup);
    // document.removeEventListener('keydown', this.overrideEscapeKeydown);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  public setStartButtonVisibility = (visible: boolean, levelId: string) => {
    const { isRandomizer } = this.gameState;
    if (isRandomizer) {
      this.gameModeMenuElements[GameModeMenuElement.Randomizer].style.visibility = visible ? 'visible' : 'hidden';
      this.gameModeMenuElements[GameModeMenuElement.Randomizer].classList.add('active');
    } else if (levelId === START_CHALLENGE_LEVEL_ID) {
      this.gameModeMenuElements[GameModeMenuElement.Challenge].style.visibility = visible ? 'visible' : 'hidden';
      this.gameModeMenuElements[GameModeMenuElement.Challenge].classList.add('active');
    } else {
      this.gameModeMenuElements[GameModeMenuElement.Campaign].style.visibility = visible ? 'visible' : 'hidden';
      this.gameModeMenuElements[GameModeMenuElement.Campaign].classList.add('active');
    }
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

  private onSelectGameModeCampaign = () => {
    this.callAction(InputAction.StartGame);
  }

  private onSelectGameModeChallenge = () => {
    this.callAction(InputAction.StartGame, START_CHALLENGE_LEVEL_ID);
  }

  private onSelectGameModeLevelSelect = () => {
    this.callAction(InputAction.ShowLevelSelectMenu);
  }

  private onSelectGameModeRandomizer = () => {
    this.gameState.isRandomizer = true;
    this.callAction(InputAction.StartGame);
  }

  private onSelectGameModeBack = () => {
    this.callAction(InputAction.HideGameModeMenu);
  }
}
