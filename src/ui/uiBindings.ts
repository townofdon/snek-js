
import P5 from 'p5';
import { setMusicVolume, setSfxVolume } from '../engine/audio';
import {
  GameMode,
  GameSettings,
  GameState,
  SFXInstance,
  Sound,
  UICancelHandler,
  UIHandler,
  UIInteractHandler,
  UINavDir,
  UINavEventHandler,
} from '../types';
import { InputAction } from '../types';
import {
  GameModeMenuElement as GameModeButton,
  GameModeMenuNavMap,
  GameOverMenuElement,
  GameOverMenuNavMap,
  MainMenuButton,
  MainMenuNavMap,
  PauseMenuElement,
  PauseMenuNavMap,
  SettingsMenuElement,
  SettingsMenuNavMap,
} from './uiNavMap';
import { UI } from './ui';
import { requireElementById } from './uiUtils';
import { gamepadPressed, getGamepad } from '../engine/gamepad';
import { Button } from '../engine/gamepad/StandardGamepadMapping';
import { offUIEvent, onUIEvent, UIAction } from './uiEvents';

interface UIBindingsCallbacks {
  onSetMusicVolume: (volume: number) => void,
  onSetSfxVolume: (volume: number) => void,
  onToggleCasualMode: (value?: boolean) => void,
  onToggleCobraMode: (value?: boolean) => void,
  onWarpToLevel: (index: number) => void,
}

export class UIBindings implements UIHandler {
  private p5: P5;
  private sfx: SFXInstance;
  private gameState: GameState;
  private settings: GameSettings;
  private callbacks: UIBindingsCallbacks = {
    onSetMusicVolume: (volume: number) => { },
    onSetSfxVolume: (volume: number) => { },
    onToggleCasualMode: (value?: boolean) => { },
    onToggleCobraMode: (value?: boolean) => { },
    onWarpToLevel: (index: number) => { }
  };
  private callAction: (action: InputAction) => void;
  private callPauseMenuAction = (element: PauseMenuElement) => {
    switch (element) {
      case PauseMenuElement.ButtonResume:
        this.callAction(InputAction.UnPause);
        break;
      case PauseMenuElement.ButtonMainMenu:
        this.callAction(InputAction.ConfirmShowMainMenu);
        break;
      case PauseMenuElement.ButtonSettings:
        this.callAction(InputAction.ShowSettingsMenu);
        break;
      case PauseMenuElement.ButtonWarp01:
        this.callbacks.onWarpToLevel(1);
        break;
      case PauseMenuElement.ButtonWarp02:
        this.callbacks.onWarpToLevel(2);
        break;
      case PauseMenuElement.ButtonWarp03:
        this.callbacks.onWarpToLevel(3);
        break;
      case PauseMenuElement.ButtonWarp04:
        this.callbacks.onWarpToLevel(4);
        break;
      case PauseMenuElement.ButtonWarp05:
        this.callbacks.onWarpToLevel(5);
        break;
      case PauseMenuElement.ButtonWarp06:
        this.callbacks.onWarpToLevel(6);
        break;
      case PauseMenuElement.ButtonWarp07:
        this.callbacks.onWarpToLevel(7);
        break;
      case PauseMenuElement.ButtonWarp08:
        this.callbacks.onWarpToLevel(8);
        break;
      case PauseMenuElement.ButtonWarp09:
        this.callbacks.onWarpToLevel(9);
        break;
      case PauseMenuElement.ButtonWarp10:
        this.callbacks.onWarpToLevel(10);
        break;
      case PauseMenuElement.ButtonWarp11:
        this.callbacks.onWarpToLevel(11);
        break;
      case PauseMenuElement.ButtonWarp12:
        this.callbacks.onWarpToLevel(12);
        break;
      case PauseMenuElement.ButtonWarp13:
        this.callbacks.onWarpToLevel(13);
        break;
      case PauseMenuElement.ButtonWarp14:
        this.callbacks.onWarpToLevel(14);
        break;
      case PauseMenuElement.ButtonWarp15:
        this.callbacks.onWarpToLevel(15);
        break;
      case PauseMenuElement.ButtonWarp16:
        this.callbacks.onWarpToLevel(16);
        break;
      case PauseMenuElement.ButtonWarp17:
        this.callbacks.onWarpToLevel(17);
        break;
      case PauseMenuElement.ButtonWarp18:
        this.callbacks.onWarpToLevel(18);
        break;
      case PauseMenuElement.ButtonWarp19:
        this.callbacks.onWarpToLevel(19);
        break;
      case PauseMenuElement.ButtonWarp20:
        this.callbacks.onWarpToLevel(99);
        break;
      case PauseMenuElement.ButtonWarpS1:
        this.callbacks.onWarpToLevel(110);
        break;
      case PauseMenuElement.ButtonWarpS2:
        this.callbacks.onWarpToLevel(120);
        break;
      case PauseMenuElement.ButtonWarpS3:
        this.callbacks.onWarpToLevel(130);
        break;
      case PauseMenuElement.ButtonWarpS4:
        this.callbacks.onWarpToLevel(140);
        break;
    }
  }
  private callGameOverMenuAction = (element: GameOverMenuElement) => {
    switch (element) {
      case GameOverMenuElement.ButtonTryAgain:
        this.callAction(InputAction.RetryLevel);
        break;
      case GameOverMenuElement.ButtonMainMenu:
        this.callAction(InputAction.ConfirmShowMainMenu);
        break;
    }
  }
  private callGameModeMenuAction = (element: GameModeButton) => {
    switch (element) {
      case GameModeButton.Campaign:
        this.callAction(InputAction.StartGame);
        break;
      case GameModeButton.LevelSelect:
        // TODO: IMPL
        break;
      case GameModeButton.Randomizer:
        // TODO: IMPL
        break;
      case GameModeButton.Back:
        this.callAction(InputAction.ShowMainMenu);
        break;
    }
  }

  private mainMenuNavMap: MainMenuNavMap;
  private mainMenuButtons: Record<MainMenuButton, HTMLButtonElement> = {
    [MainMenuButton.StartGame]: null,
    [MainMenuButton.OSTMode]: null,
    [MainMenuButton.QuoteMode]: null,
    [MainMenuButton.Leaderboard]: null,
    [MainMenuButton.Settings]: null,
    [MainMenuButton.Community]: null,
  }
  private settingsMenuNavMap: SettingsMenuNavMap;
  private settingsMenuElements: Record<SettingsMenuElement, HTMLInputElement | HTMLButtonElement> = {
    [SettingsMenuElement.CheckboxCasualMode]: null,
    [SettingsMenuElement.CheckboxCobraMode]: null,
    [SettingsMenuElement.CheckboxDisableScreenshake]: null,
    [SettingsMenuElement.SliderMusicVolume]: null,
    [SettingsMenuElement.SliderSfxVolume]: null,
    [SettingsMenuElement.ButtonClose]: null,
  }
  private pauseMenuNavMap: PauseMenuNavMap;
  private gameOverMenuNavMap: GameOverMenuNavMap;
  private gameModeMenuNavMap: GameModeMenuNavMap;
  private gameModeMenuElements: Record<GameModeButton, HTMLButtonElement> = {
    [GameModeButton.Campaign]: undefined,
    [GameModeButton.LevelSelect]: undefined,
    [GameModeButton.Randomizer]: undefined,
    [GameModeButton.Back]: undefined
  }

  constructor(p5: P5, sfx: SFXInstance, gameState: GameState, settings: GameSettings, callbacks: UIBindingsCallbacks, callAction: (action: InputAction) => void) {
    this.p5 = p5;
    this.sfx = sfx;
    this.gameState = gameState;
    this.settings = settings;
    this.callbacks = callbacks;
    this.callAction = callAction;
    this.assignElements();
    this.mainMenuNavMap = new MainMenuNavMap(
      this.mainMenuButtons,
      {
        [MainMenuButton.StartGame]: InputAction.ChooseGameMode,
        [MainMenuButton.OSTMode]: InputAction.EnterOstMode,
        [MainMenuButton.QuoteMode]: InputAction.EnterQuoteMode,
        [MainMenuButton.Leaderboard]: InputAction.ShowLeaderboard,
        [MainMenuButton.Settings]: InputAction.ShowSettingsMenu,
        [MainMenuButton.Community]: InputAction.GotoCommunityPage,
      },
      callAction
    );
    this.settingsMenuNavMap = new SettingsMenuNavMap(this.settingsMenuElements, callAction);
    this.pauseMenuNavMap = new PauseMenuNavMap(this.callPauseMenuAction);
    this.gameOverMenuNavMap = new GameOverMenuNavMap(this.callGameOverMenuAction);
    this.gameModeMenuNavMap = new GameModeMenuNavMap(this.callGameModeMenuAction);
    onUIEvent(this.handleUIEvent);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  handleUINavigation: UINavEventHandler = (navDir) => {
    if (UI.getIsSettingsMenuShowing()) {
      switch (navDir) {
        case UINavDir.Prev:
        case UINavDir.Up:
          this.settingsMenuNavMap.gotoPrev();
          break;
        case UINavDir.Next:
        case UINavDir.Down:
          this.settingsMenuNavMap.gotoNext();
          break;
        case UINavDir.Left:
          if (gamepadPressed(getGamepad(), Button.DpadLeft)) {
            const focused = this.settingsMenuNavMap.getFocused()
            return this.moveSlider(focused, -1);
          }
          // do not handle event so that slider can receive left/right DOM event
          return false;
        case UINavDir.Right:
          if (gamepadPressed(getGamepad(), Button.DpadRight)) {
            const focused = this.settingsMenuNavMap.getFocused()
            return this.moveSlider(focused, 1);
          }
          // do not handle event so that slider can receive left/right DOM event
          return false;
      }
      return true;
    }
    if (UI.getIsMainMenuShowing()) {
      switch (navDir) {
        case UINavDir.Prev:
        case UINavDir.Up:
        case UINavDir.Left:
          this.mainMenuNavMap.gotoPrev();
          break;
        case UINavDir.Next:
        case UINavDir.Down:
        case UINavDir.Right:
          this.mainMenuNavMap.gotoNext();
          break;
      }
      return true;
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
          this.gameOverMenuNavMap.gotoPrev();
          break;
        case UINavDir.Next:
          this.gameOverMenuNavMap.gotoNext();
          break;
        case UINavDir.Up:
          this.gameOverMenuNavMap.gotoUp();
          break;
        case UINavDir.Down:
          this.gameOverMenuNavMap.gotoDown();
          break;
        case UINavDir.Left:
          this.gameOverMenuNavMap.gotoLeft();
          break;
        case UINavDir.Right:
          this.gameOverMenuNavMap.gotoRight();
          break;
      }
      return true;
    }
    if (this.gameState.isPaused) {
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
    if (UI.getIsSettingsMenuShowing()) {
      return this.settingsMenuNavMap.callSelected();
    }
    if (UI.getIsMainMenuShowing()) {
      return this.mainMenuNavMap.callSelected();
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
    if (UI.getIsSettingsMenuShowing()) {
      this.onHideSettingsMenuClick();
      return true;
    }
    if (UI.getIsGameModeMenuShowing()) {
      this.callAction(InputAction.CancelChooseGameMode);
      return true;
    }
    return false;
  }

  moveSlider = (focused: SettingsMenuElement | null, direction: number): boolean => {
    if (focused === SettingsMenuElement.SliderMusicVolume) {
      const elem = this.settingsMenuElements[SettingsMenuElement.SliderMusicVolume] as HTMLInputElement;
      const volume = Math.max((parseFloat(elem.value) || 0) + (direction * 0.1), 0)
      elem.value = String(volume);
      setMusicVolume(volume);
      this.callbacks.onSetMusicVolume(volume);
      return true
    } else if (focused === SettingsMenuElement.SliderSfxVolume) {
      const elem = this.settingsMenuElements[SettingsMenuElement.SliderSfxVolume] as HTMLInputElement;
      const volume = Math.max((parseFloat(elem.value) || 0) + (direction * 0.1), 0)
      elem.value = String(volume);
      this.sfx.setGlobalVolume(volume);
      setSfxVolume(volume);
      this.callbacks.onSetSfxVolume(volume);
      this.sfx.play(Sound.eat);
      return true
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
    this.settingsMenuElements[SettingsMenuElement.SliderMusicVolume].value = String(this.settings.musicVolume);
    this.settingsMenuElements[SettingsMenuElement.SliderSfxVolume].value = String(this.settings.sfxVolume);
    (this.settingsMenuElements[SettingsMenuElement.CheckboxCasualMode] as HTMLInputElement).checked = this.gameState.gameMode === GameMode.Casual;
    (this.settingsMenuElements[SettingsMenuElement.CheckboxCobraMode] as HTMLInputElement).checked = this.gameState.gameMode === GameMode.Cobra;
    (this.settingsMenuElements[SettingsMenuElement.CheckboxDisableScreenshake] as HTMLInputElement).checked = this.settings.isScreenShakeDisabled;
  }

  private assignElements = () => {
    this.mainMenuButtons[MainMenuButton.StartGame] = requireElementById<HTMLButtonElement>('ui-button-start');
    this.mainMenuButtons[MainMenuButton.OSTMode] = requireElementById<HTMLButtonElement>('ui-button-ost-mode');
    this.mainMenuButtons[MainMenuButton.QuoteMode] = requireElementById<HTMLButtonElement>('ui-button-quote-mode');
    this.mainMenuButtons[MainMenuButton.Leaderboard] = requireElementById<HTMLButtonElement>('ui-button-leaderboard');
    this.mainMenuButtons[MainMenuButton.Settings] = requireElementById<HTMLButtonElement>('ui-button-settings');
    this.mainMenuButtons[MainMenuButton.Community] = requireElementById<HTMLButtonElement>('ui-button-community');

    this.settingsMenuElements[SettingsMenuElement.ButtonClose] = requireElementById<HTMLButtonElement>('settings-menu-close-button');
    this.settingsMenuElements[SettingsMenuElement.CheckboxCasualMode] = requireElementById<HTMLInputElement>('checkbox-casual-mode');
    this.settingsMenuElements[SettingsMenuElement.CheckboxCobraMode] = requireElementById<HTMLInputElement>('checkbox-cobra-mode');
    this.settingsMenuElements[SettingsMenuElement.CheckboxDisableScreenshake] = requireElementById<HTMLInputElement>('checkbox-disable-screenshake');
    this.settingsMenuElements[SettingsMenuElement.SliderMusicVolume] = requireElementById<HTMLInputElement>('slider-volume-music');
    this.settingsMenuElements[SettingsMenuElement.SliderSfxVolume] = requireElementById<HTMLInputElement>("slider-volume-sfx");

    this.gameModeMenuElements[GameModeButton.Campaign] = requireElementById<HTMLButtonElement>('button-game-mode-campaign')
    this.gameModeMenuElements[GameModeButton.LevelSelect] = requireElementById<HTMLButtonElement>('button-game-mode-level-select')
    this.gameModeMenuElements[GameModeButton.Randomizer] = requireElementById<HTMLButtonElement>('button-game-mode-randomizer')
    this.gameModeMenuElements[GameModeButton.Back] = requireElementById<HTMLButtonElement>('button-game-mode-back')
  }

  private handleUIEvent = (action: UIAction = UIAction.None) => {
      const cleanup = action === UIAction.Cleanup;
      if (action === UIAction.ShowMainMenu) {
        this.mainMenuButtons[MainMenuButton.StartGame].addEventListener('click', this.handleStartGame);
        this.mainMenuButtons[MainMenuButton.OSTMode].addEventListener('click', this.handleEnterOstMode);
        this.mainMenuButtons[MainMenuButton.QuoteMode].addEventListener('click', this.handleEnterQuoteMode);
        this.mainMenuButtons[MainMenuButton.Leaderboard].addEventListener('click', this.handleShowLeaderboard);
        this.mainMenuButtons[MainMenuButton.Settings].addEventListener('click', this.handleShowSettingsMenu);
      } else if (cleanup || action === UIAction.HideMainMenu) {
        this.mainMenuButtons[MainMenuButton.StartGame].removeEventListener('click', this.handleStartGame);
        this.mainMenuButtons[MainMenuButton.OSTMode].removeEventListener('click', this.handleEnterOstMode);
        this.mainMenuButtons[MainMenuButton.QuoteMode].removeEventListener('click', this.handleEnterQuoteMode);
        this.mainMenuButtons[MainMenuButton.Leaderboard].removeEventListener('click', this.handleShowLeaderboard);
        this.mainMenuButtons[MainMenuButton.Settings].removeEventListener('click', this.handleShowSettingsMenu);
      } else if (action === UIAction.ShowSettingsMenu) {
        this.settingsMenuElements[SettingsMenuElement.ButtonClose].addEventListener('click', this.onHideSettingsMenuClick);
        this.settingsMenuElements[SettingsMenuElement.CheckboxCasualMode].addEventListener('change', this.onCheckboxCasualModeChange);
        this.settingsMenuElements[SettingsMenuElement.CheckboxCobraMode].addEventListener('change', this.onCheckboxCobraModeChange);
        this.settingsMenuElements[SettingsMenuElement.CheckboxDisableScreenshake].addEventListener('change', this.onCheckboxDisableScreenshakeChange);
        this.settingsMenuElements[SettingsMenuElement.SliderMusicVolume].addEventListener('input', this.onMusicSliderInput);
        this.settingsMenuElements[SettingsMenuElement.SliderSfxVolume].addEventListener('input', this.onSfxSliderInput);
      } else if (cleanup || action === UIAction.HideSettingsMenu) {
        this.settingsMenuElements[SettingsMenuElement.ButtonClose].removeEventListener('click', this.onHideSettingsMenuClick);
        this.settingsMenuElements[SettingsMenuElement.CheckboxCasualMode].removeEventListener('change', this.onCheckboxCasualModeChange);
        this.settingsMenuElements[SettingsMenuElement.CheckboxCobraMode].removeEventListener('change', this.onCheckboxCobraModeChange);
        this.settingsMenuElements[SettingsMenuElement.CheckboxDisableScreenshake].removeEventListener('change', this.onCheckboxDisableScreenshakeChange);
        this.settingsMenuElements[SettingsMenuElement.SliderMusicVolume].removeEventListener('input', this.onMusicSliderInput);
        this.settingsMenuElements[SettingsMenuElement.SliderSfxVolume].removeEventListener('input', this.onSfxSliderInput);
      } else if (action === UIAction.ShowGameModeMenu) {
        this.gameModeMenuElements[GameModeButton.Campaign].addEventListener('click', this.onSelectGameModeCampaign);
        this.gameModeMenuElements[GameModeButton.LevelSelect].addEventListener('click', this.onSelectGameModeLevelSelect);
        this.gameModeMenuElements[GameModeButton.Randomizer].addEventListener('click', this.onSelectGameModeRandomizer);
        this.gameModeMenuElements[GameModeButton.Back].addEventListener('click', this.onSelectGameModeBack);
      } else if (cleanup || action === UIAction.HideGameModeMenu) {
        this.gameModeMenuElements[GameModeButton.Campaign].removeEventListener('click', this.onSelectGameModeCampaign);
        this.gameModeMenuElements[GameModeButton.LevelSelect].removeEventListener('click', this.onSelectGameModeLevelSelect);
        this.gameModeMenuElements[GameModeButton.Randomizer].removeEventListener('click', this.onSelectGameModeRandomizer);
        this.gameModeMenuElements[GameModeButton.Back].removeEventListener('click', this.onSelectGameModeBack);
      } else if (cleanup || action === UIAction.HideLevelSelectMenu) {
        // TODO: ADD ACTIONS
      }
  }

  public cleanup = () => {
    offUIEvent(this.handleUIEvent);
    this.handleUIEvent(UIAction.Cleanup);
    // document.removeEventListener('keydown', this.overrideEscapeKeydown);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  public setStartButtonVisibility = (visible: boolean) => {
    this.gameModeMenuElements[GameModeButton.Campaign].style.visibility = visible ? 'visible' : 'hidden';
    this.gameModeMenuElements[GameModeButton.Campaign].classList.add('active');
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

  private onHideSettingsMenuClick = () => {
    this.callAction(InputAction.HideSettingsMenu);
  }

  private onCheckboxCasualModeChange = (ev: InputEvent) => {
    const isCasualModeEnabled = (ev.target as HTMLInputElement).checked;
    this.callbacks.onToggleCasualMode(isCasualModeEnabled);
  }

  private onCheckboxCobraModeChange = (ev: InputEvent) => {
    const isCobraModeEnabled = (ev.target as HTMLInputElement).checked;
    this.callbacks.onToggleCobraMode(isCobraModeEnabled);
  }

  private onCheckboxDisableScreenshakeChange = (ev: InputEvent) => {
    this.callAction(InputAction.ToggleScreenshakeDisabled);
  }

  private onMusicSliderInput = (ev: InputEvent) => {
    const volume = parseFloat((ev.target as HTMLInputElement).value);
    setMusicVolume(volume);
    this.callbacks.onSetMusicVolume(volume);
  }

  private onSfxSliderInput = (ev: InputEvent) => {
    const volume = parseFloat((ev.target as HTMLInputElement).value);
    this.sfx.setGlobalVolume(volume);
    setSfxVolume(volume);
    this.callbacks.onSetSfxVolume(volume);
    this.sfx.play(Sound.eat);
  }

  private handleStartGame = () => {
    this.callAction(InputAction.ChooseGameMode);
  }

  private handleEnterOstMode = () => {
    this.callAction(InputAction.EnterOstMode);
  }

  private handleEnterQuoteMode = () => {
    this.callAction(InputAction.EnterQuoteMode);
  }

  private handleShowLeaderboard = () => {
    this.callAction(InputAction.ShowLeaderboard);
  }

  private handleShowSettingsMenu = () => {
    this.callAction(InputAction.ShowSettingsMenu);
  }

  private onSelectGameModeCampaign = () => {
    this.callAction(InputAction.StartGame);
  }

  private onSelectGameModeLevelSelect = () => {
    // TODO: IMPL
  }

  private onSelectGameModeRandomizer = () => {
    // TODO: IMPL
  }

  private onSelectGameModeBack = () => {
    this.callAction(InputAction.CancelChooseGameMode);
  }
}
