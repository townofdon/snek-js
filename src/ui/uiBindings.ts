
import P5 from 'p5';
import { setMusicVolume, setSfxVolume } from '../engine/audio';
import {
  GameMode,
  GameSettings,
  GameState,
  Initiator,
  ISFX,
  Sound,
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
  LevelSelectMenuNavMap,
  PauseMenuElement,
  PauseMenuNavMap,
} from './uiNavMap';
import { UI } from './ui';
import { parseElementLevelNum, requireElementById } from './uiUtils';
import { unsubscribeOnUIEvent, onUIEvent, emitUIEvent } from './uiEvents';
import { getIsChallengeLevel, getWarpLevelFromNum, START_CHALLENGE_LEVEL_NUM } from '../levels/levelUtils';
import { GameModeMenuElement } from './uiTypes';
import { CHALLENGE_LEVELS } from '../levels/levelConstants';
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
        this.callAction(InputAction.StartGame, START_CHALLENGE_LEVEL_NUM);
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
  private levelSelectMenuNavMap: LevelSelectMenuNavMap;
  private levelSelectMenu: HTMLElement;
  private levelSelectMenuBackButton: HTMLButtonElement;
  private levelSelectChallengeHeading: HTMLElement;
  private levelSelectMapNum: HTMLElement;
  private levelSelectMapName: HTMLElement;
  private levelSelectScroll: HTMLElement;
  private levelSelectItems: HTMLElement[];

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
    this.levelSelectMenuNavMap = new LevelSelectMenuNavMap(
      this.callLevelSelectMenuAction,
      this.levelSelectItems.map((elem => elem.id)),
    )
    onUIEvent(this.handleUIEvent);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  handleUINavigation: UINavEventHandler = (navDir) => {
    if (UI.getIsLevelSelectMenuShowing()) {
      const success = (() => {
        switch (navDir) {
          case UINavDir.Up:
            return this.levelSelectMenuNavMap.gotoUp();
          case UINavDir.Down:
            return this.levelSelectMenuNavMap.gotoDown();
          case UINavDir.Prev:
          case UINavDir.Left:
            return this.levelSelectMenuNavMap.gotoLeft();
          case UINavDir.Next:
          case UINavDir.Right:
            return this.levelSelectMenuNavMap.gotoRight();
          default:
            return false;
        }
      })()
      if (!success) {
        return false;
      }
      const elem = this.levelSelectMenuNavMap.getActiveElement();
      if (elem.id === 'button-level-select-back') {
        return true;
      }
      const levelNum = parseElementLevelNum(elem as HTMLButtonElement);
      const level = getWarpLevelFromNum(levelNum);
      const [, idx] = this.levelSelectMenuNavMap.getActiveIndex();
      if (!elem || idx < 0) {
        console.warn('active level or active index not found', elem, idx);
        return true;
      }
      const reg = /scale\((.+)\)/;
      const scale = parseFloat(this.main.style.transform?.match(reg)[1]) || 1;
      const diff = this.levelSelectItems[1].getBoundingClientRect().x - this.levelSelectItems[0].getBoundingClientRect().x;
      const maxScroll = (diff / scale) * this.levelSelectItems.length;
      const scrollAmt = idx / this.levelSelectItems.length;
      if (getIsChallengeLevel(level)) {
        const challengeLevelIndex = CHALLENGE_LEVELS.indexOf(level);
        this.levelSelectChallengeHeading.classList.remove('hidden');
        this.levelSelectMapNum.innerText = String(challengeLevelIndex + 1).padStart(2, '0');
      } else {
        this.levelSelectChallengeHeading.classList.add('hidden');
        this.levelSelectMapNum.innerText = String(idx + 1).padStart(2, '0');
      }
      this.levelSelectMapName.innerText = level.name;
      this.levelSelectScroll.scrollTo({ left: scrollAmt * maxScroll });
      return true;
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
      if (bridge.debugMenu.onNavigate(navDir)) {
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
      return this.levelSelectMenuNavMap.callSelected();
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
      return this.pauseMenuNavMap.callSelected();
    }
    return false;
  }

  handleUICancel: UICancelHandler = () => {
    if (UI.getIsLevelSelectMenuShowing()) {
      this.callAction(InputAction.HideLevelSelectMenu);
      return true;
    }
    if (UI.getIsSettingsMenuShowing()) {
      return bridge.settingsMenu?.onCancel?.() || false;
    }
    if (UI.getIsGameModeMenuShowing()) {
      this.callAction(InputAction.HideGameModeMenu);
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

    this.levelSelectMenu = requireElementById<HTMLElement>('level-select-menu');
    this.levelSelectMenuBackButton = requireElementById<HTMLButtonElement>('button-level-select-back');
    this.levelSelectChallengeHeading = requireElementById<HTMLElement>('level-select-challenge-heading');
    this.levelSelectMapNum = requireElementById<HTMLElement>('level-select-map-number');
    this.levelSelectMapName = requireElementById<HTMLElement>('level-select-map-name');
    this.levelSelectScroll = requireElementById<HTMLElement>('level-select-levels');
    this.levelSelectItems = (() => {
      const order: HTMLElement[] = []
      const buttons = this.levelSelectMenu.querySelectorAll('button.select-level');
      buttons.forEach(button => {
        order.push(button as HTMLElement);
      })
      return order;
    })()
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
      if (action === InputAction.ShowLevelSelectMenu) {
        this.levelSelectMenu.addEventListener('click', this.onLevelSelect);
        this.levelSelectMenuBackButton.addEventListener('click', this.onHideLevelSelectMenu);
        this.levelSelectMenuNavMap.gotoFirst();
        this.levelSelectScroll.scrollTo({ left: 0 });
        this.levelSelectMapNum.innerText = '01';
        this.levelSelectMapName.innerText = 'Snekadia';
        this.levelSelectChallengeHeading.classList.add('hidden');
      }
      if (cleanup || action === InputAction.HideLevelSelectMenu) {
        this.levelSelectMenu.removeEventListener('click', this.onLevelSelect);
        this.levelSelectMenuBackButton.removeEventListener('click', this.onHideLevelSelectMenu);
      }
  }

  public cleanup = () => {
    unsubscribeOnUIEvent(this.handleUIEvent);
    // this.handleUIEvent(InputAction.Cleanup);
    // document.removeEventListener('keydown', this.overrideEscapeKeydown);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  public setStartButtonVisibility = (visible: boolean, levelNum = -1) => {
    const { isRandomizer } = this.gameState;
    if (isRandomizer) {
      this.gameModeMenuElements[GameModeMenuElement.Randomizer].style.visibility = visible ? 'visible' : 'hidden';
      this.gameModeMenuElements[GameModeMenuElement.Randomizer].classList.add('active');
    } else if (levelNum === START_CHALLENGE_LEVEL_NUM) {
      this.gameModeMenuElements[GameModeMenuElement.Challenge].style.visibility = visible ? 'visible' : 'hidden';
      this.gameModeMenuElements[GameModeMenuElement.Challenge].classList.add('active');
    } else {
      this.gameModeMenuElements[GameModeMenuElement.Campaign].style.visibility = visible ? 'visible' : 'hidden';
      this.gameModeMenuElements[GameModeMenuElement.Campaign].classList.add('active');
    }
    if (levelNum > 0 && this.levelSelectMenu) {
      const elem = this.levelSelectMenu.querySelector(`button[data-level="${levelNum}"]`) as HTMLElement;
      if (elem) {
        elem.style.visibility = visible ? 'visible' : 'hidden';
        elem.classList.add('active');
      }
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
    this.callAction(InputAction.StartGame, START_CHALLENGE_LEVEL_NUM);
  }

  private onSelectGameModeLevelSelect = () => {
    this.callAction(InputAction.ShowLevelSelectMenu);
  }

  private onHideLevelSelectMenu = () => {
    this.callAction(InputAction.HideLevelSelectMenu);
  }

  private onSelectGameModeRandomizer = () => {
    this.gameState.isRandomizer = true;
    this.callAction(InputAction.StartGame);
  }

  private onSelectGameModeBack = () => {
    this.callAction(InputAction.HideGameModeMenu);
  }

  private onLevelSelect = (ev: MouseEvent) => {
    ev.preventDefault();
    const element = ev.target as HTMLButtonElement
    const level = parseElementLevelNum(element);
    if (level <= 0) {
      console.warn('could not parse level from dataset', element, element?.dataset);
      return;
    }
    this.callAction(InputAction.StartGame, level);
  }
}
