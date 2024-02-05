import P5, { Element } from 'p5';
import { faker } from '@faker-js/faker';

import { GameState, IEnumerator, SFXInstance, Sound, TitleVariant, UICancelHandler, UIHandler, UIInteractHandler, UINavDir, UINavEventHandler, UISection } from './types';
import { getMusicVolume, getSfxVolume, setMusicVolume, setSfxVolume } from './audio';
import { DOM, MainMenuButton, UINavMapMainMenu } from './uiNavMap';
import { InputAction } from './controls';

const UI_LABEL_OFFSET = '18px';
const UI_PARENT_ID = 'game';

const LABEL_COLOR = '#fff';
const LABEL_COLOR_INVERTED = '#000';
const LABEL_BG_COLOR = 'rgba(0,0,0, 0.5)';
const LABEL_BG_COLOR_INVERTED = 'rgba(255,255,255, 0.5)';

const TITLE_VARIANT_TRANSITION_TIME_MS = 2000;

export class UI {

  private static p5: P5;

  private static isSettingsMenuShowing = false;
  private static isMainMenuShowing = false;

  static getIsSettingsMenuShowing = () => UI.isSettingsMenuShowing;
  static getIsMainMenuShowing = () => UI.isMainMenuShowing;

  static setP5Instance(p5: P5) {
    UI.p5 = p5;
  }

  static enableGameBlur() {
    const game = document.getElementById('game');
    game.classList.add('blur');
  }

  static disableGameBlur() {
    const game = document.getElementById('game');
    game.classList.remove('blur');
  }

  static hideStartScreen() {
    document.getElementById('start-screen').remove();
  }

  static showTitle() {
    const title = document.getElementById('main-title');
    if (!title) return;
    title.style.display = 'block';
  }

  static hideTitle() {
    const title = document.getElementById('main-title');
    if (!title) return;
    title.style.display = 'none';
  }

  static showMainMenu() {
    document.getElementById('main-ui-buttons').classList.remove('hidden');
    DOM.select(document.getElementById('ui-button-start'));
    UI.isMainMenuShowing = true;
  }

  static hideMainMenu() {
    document.getElementById('main-ui-buttons').classList.add('hidden');
    UI.isMainMenuShowing = false;
  }

  static showSettingsMenu(isInGameMenu = false) {
    UI.enableGameBlur();
    const settingsMenu = document.getElementById('settings-menu');
    settingsMenu.style.display = 'block';
    settingsMenu.classList.remove('hidden');
    const gameplaySettingsSection = document.getElementById('settings-section-gameplay');
    gameplaySettingsSection.style.display = isInGameMenu
      ? 'none'
      : 'block';
    UI.isSettingsMenuShowing = true;
  }

  static hideSettingsMenu() {
    UI.disableGameBlur();
    document.getElementById('settings-menu').style.display = 'none';
    UI.isSettingsMenuShowing = false;
  }

  static showMainCasualModeLabel() {
    const label = document.getElementById('main-menu-label-casual-mode');
    label.classList.remove('hidden');
  }

  static hideMainCasualModeLabel() {
    const label = document.getElementById('main-menu-label-casual-mode');
    label.classList.add('hidden');
  }

  static showLoader(yPos: number) {
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
    loader.style.top = String(yPos);
  }

  static hideLoader() {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
  }

  static drawTitle(title = '', textColor = '#fff', offset: number, hasShadow: boolean, uiElements: Element[]) {
    const p = UI.p5.createP("");
    for (let i = 0; i < title.length; i++) {
      const span = UI.p5.createSpan(title[i]);
      span.parent(p);
    }
    p.id('title');
    p.style('font-size', '6em');
    p.style('letter-spacing', '65px');
    p.style('color', textColor);
    p.style('line-height', '1em');
    p.style('font-family', "'Monofett', monospace");
    p.style('white-space', 'nowrap');
    if (hasShadow) {
      p.style('text-shadow', '6px 6px 3px black');
    }
    p.position(84 + offset, 7 + offset);
    p.parent(UI_PARENT_ID);
    p.addClass("main-title");
    uiElements.push(p);
    return p;
  }

  static clearLabels() {
    document.getElementById('level-name-field-1')?.remove();
    document.getElementById('level-name-field-2')?.remove();
    document.getElementById('hearts-container')?.remove();
    document.getElementById('score-field')?.remove();
    document.getElementById('difficulty-field')?.remove();
    document.getElementById('casual-rewind-tip-field')?.remove();
  }

  static renderLevelName(levelName = '', isShowingDeathColours: boolean, progress = 0) {
    const id1 = 'level-name-field-1'
    const id2 = 'level-name-field-2'
    document.getElementById(id1)?.remove();
    document.getElementById(id2)?.remove();
    const p1 = UI.p5.createP(levelName).id(id1);
    const p2 = progress > Number.EPSILON ? UI.p5.createP(levelName).id(id2) : null;
    const applyStyles = (p: P5.Element | null, backgroundColor: string, color: string) => {
      if (!p) return;
      p.position(0, 0);
      p.style('font-size', '1em');
      p.style('background-color', backgroundColor);
      p.style('color', color);
      p.style('line-height', '1em');
      p.style('white-space', 'nowrap');
      p.style('top', 'inherit');
      p.style('left', 'inherit');
      p.style('bottom', '0');
      p.style('right', UI_LABEL_OFFSET);
      p.style('margin', '0');
      p.style('padding', '1px 8px');
      p.style('text-align', 'right');
      p.parent(UI_PARENT_ID);
    }
    applyStyles(p1, isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR, isShowingDeathColours ? LABEL_COLOR_INVERTED : LABEL_COLOR);
    // applyStyles(p2, isShowingDeathColours ? LABEL_COLOR_INVERTED : "#14a3b4", isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : "black");
    applyStyles(p2, isShowingDeathColours ? LABEL_COLOR_INVERTED : "#ffffffdd", isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : "black");
    if (progress > Number.EPSILON) {
      UI.applyLevelProgressInverted(p1, progress);
      UI.applyLevelProgress(p2, progress);
    }
  }

  private static applyLevelProgress(elem: P5.Element, progress: number) {
    if (!elem) return;
    const percentage = progress * 100;
    const polygon = `polygon(0% 10%, ${percentage}% 10%, ${percentage}% 90%, 0 90%)`;
    elem.style('clip-path', polygon);
    elem.style('-webkit-clip-path', polygon);
  }

  private static applyLevelProgressInverted(elem: P5.Element, progress: number) {
    if (!elem) return;
    const percentage = progress * 100;
    const polygon = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
    elem.style('clip-path', polygon);
    elem.style('-webkit-clip-path', polygon);
  }

  static renderHearts(numLives = 3, isShowingDeathColours: boolean) {
    const containerId = "hearts-container";
    const className = "hearts-container";
    const getLabelColor = (index: number) => {
      if (isShowingDeathColours) return LABEL_COLOR_INVERTED;
      if (numLives === 0) return '#f50';
      if (index < numLives) return '#fff';
      return '#888';
    }
    const labelBackgroundColor = (() => {
      if (isShowingDeathColours) return LABEL_COLOR_INVERTED;
      return numLives === 0 ? '#631705db' : 'rgb(7 11 15 / 52%)';
    })()
    document.getElementById(containerId)?.remove();
    let div = UI.p5.createDiv();
    const numHearts = 3;
    const drawHeart = (index = 0) => {
      const element = UI.p5.createP(index < numLives ? "♥︎" : "♡");
      element.style('display', 'inline-block');
      element.style('font-size', '15px');
      element.style('color', getLabelColor(index));
      element.style('text-shadow', '0px 3px 3px black');
      element.style('text-align', 'center');
      element.style('margin', '0 8px');
      element.parent(div);
    }
    for (let i = 0; i < numHearts; i++) {
      drawHeart(i);
    }
    div.position(0, 0);
    div.style('left', 'inherit');
    div.style('right', UI_LABEL_OFFSET);
    div.style('padding', '0 5px');
    div.style('background-color', labelBackgroundColor);
    div.class(className);
    div.id(containerId);
    div.parent(UI_PARENT_ID);
  }

  static renderScore(score = 0, isShowingDeathColours: boolean) {
    const id = 'score-field';
    document.getElementById(id)?.remove();
    const p = UI.p5.createP(String(score).padStart(8, '0'));
    p.position(0, 0);
    p.id(id);
    p.style('font-size', '1em');
    p.style('color', isShowingDeathColours ? LABEL_COLOR_INVERTED : LABEL_COLOR);
    p.style('background-color', isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR);
    p.style('line-height', '1em');
    p.style('white-space', 'nowrap');
    p.style('top', 'inherit');
    p.style('bottom', '0');
    p.style('left', UI_LABEL_OFFSET);
    p.style('margin', '0');
    p.style('padding', '1px 8px');
    p.style('text-align', 'left');
    p.parent(UI_PARENT_ID);
  }

  static renderDifficulty(difficultyIndex = 0, isShowingDeathColours: boolean, isCasualModeEnabled = false) {
    const id = 'difficulty-field';
    const difficultyText = (() => {
      if (difficultyIndex >= 4) return 'ULTRA';
      if (difficultyIndex >= 3) return 'HARD';
      if (difficultyIndex >= 2) return 'MEDIUM';
      if (difficultyIndex >= 1) return 'EASY';
      return 'UNKNOWN'
    })() + (isCasualModeEnabled ? ' CASUAL' : '');
    document.getElementById(id)?.remove();
    const p = UI.p5.createP(difficultyText);
    p.position(0, 0);
    p.id(id);
    p.style('font-size', '1em');
    p.style('color', isShowingDeathColours ? LABEL_COLOR_INVERTED : LABEL_COLOR);
    p.style('background-color', isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR);
    p.style('line-height', '1em');
    p.style('white-space', 'nowrap');
    p.style('left', UI_LABEL_OFFSET);
    p.style('margin', '0');
    p.style('padding', '1px 8px');
    p.style('text-align', 'left');
    p.parent(UI_PARENT_ID);
  }

  static renderCasualRewindTip() {
    const id = 'casual-rewind-tip-field';
    document.getElementById(id)?.remove();
    const p = UI.p5.createP('[DEL] rewind moves');
    p.position(0, 0);
    p.id(id);
    p.style('font-size', '1em');
    p.style('color', LABEL_COLOR);
    p.style('background-color', LABEL_BG_COLOR);
    p.style('line-height', '1em');
    p.style('white-space', 'nowrap');
    p.style('left', 'inherit');
    p.style('right', UI_LABEL_OFFSET);
    p.style('margin', '0');
    p.style('padding', '1px 8px');
    p.style('text-align', 'right');
    p.parent(UI_PARENT_ID);
  }

  static addTooltip(textStr = '', parent: P5.Element, align: 'left' | 'right' = 'left') {
    const element = UI.p5.createSpan(textStr).addClass("tooltip").addClass(`align-${align}`);
    element.parent(parent);
  }

  static drawButton(textStr = '', x = 0, y = 0, onClick: () => void, uiElements: Element[], {
    parentId = "game",
  }: {
    parentId?: string | P5.Element,
  } = {}) {
    const button = UI.p5.createButton(textStr);
    if (x >= 0 && y >= 0) {
      button.position(x, y);
    }
    button.mousePressed(onClick);
    button.parent(parentId);
    button.attribute("tabindex", "0");
    uiElements.push(button);
    return button;
  }

  static drawText(textStr = '', fontSize = '12px', y = 0, uiElements: Element[], { color = '#fff', marginLeft = 0 } = {}) {
    const element = UI.p5.createP(textStr);
    element.addClass('minimood');
    element.style('font-size', fontSize);
    element.style('color', color);
    element.style('text-shadow', '0px 3px 3px black');
    element.style('padding', '0 20px');
    element.style('width', 'calc(100% - 80px)');
    element.style('text-align', 'center');
    element.position(20 + marginLeft, y);
    element.parent(UI_PARENT_ID);
    uiElements.push(element);
  }

  static drawDarkOverlay(uiElements: Element[]) {
    let div = UI.p5.createDiv();
    div.id('dark-overlay');
    div.style('position', 'absolute');
    div.style('top', '0');
    div.style('bottom', '0');
    div.style('left', '0');
    div.style('right', '0');
    div.style('background-color', 'rgb(7 11 15 / 75%)');
    // div.style('mix-blend-mode', 'color-burn');
    div.parent(UI_PARENT_ID);
    uiElements.push(div);
  }

  static drawScreenFlash() {
    const id = "screen-flash-overlay";
    let div = UI.p5.createDiv();
    div.id(id);
    div.style('position', 'absolute');
    div.style('top', '0');
    div.style('bottom', '0');
    div.style('left', '0');
    div.style('right', '0');
    div.style('z-index', '10');
    div.style('background-color', '#ff550099');
    div.style('mix-blend-mode', 'hard-light');
    div.parent(UI_PARENT_ID);
    return div;
  }

  static disableScreenScroll() {
    document.body.style.overflowY = "hidden";
  }

  static enableScreenScroll() {
    document.body.style.overflowY = "auto";
  }
}

export class MainTitleFader {
  private prevTitleVariant: TitleVariant = TitleVariant.GrayBlue;
  private p5: P5;

  constructor(p5: P5) {
    this.p5 = p5;
  }

  setTitleVariant(variant: TitleVariant): IEnumerator {
    const prevVariant = this.prevTitleVariant;
    if (variant === prevVariant) return;

    this.prevTitleVariant = variant;
    return MainTitleFader.fadeTitleVariant(variant, prevVariant, this.p5);
  }

  private static fadeTitleVariant = function* (variant: TitleVariant, prevVariant: TitleVariant, p5: P5): IEnumerator {
    if (variant === prevVariant) return;

    const incoming = document.getElementById(MainTitleFader.getIdByTitleVariant(variant));
    const outgoing = document.getElementById(MainTitleFader.getIdByTitleVariant(prevVariant));
    if (!incoming) throw new Error(`Could not find elem for variant=${incoming},id=${MainTitleFader.getIdByTitleVariant(variant)}`)
    if (!outgoing) throw new Error(`Could not find elem for variant=${outgoing},id=${MainTitleFader.getIdByTitleVariant(prevVariant)}`)
    let t = 0;
    while (t < 1) {
      yield null;
      incoming.style.opacity = String(p5.lerp(0, 1, t));
      outgoing.style.opacity = String(p5.lerp(1, 0, t));
      t += p5.deltaTime / TITLE_VARIANT_TRANSITION_TIME_MS;
    }
  }

  private static getIdByTitleVariant(variant: TitleVariant) {
    switch (variant) {
      case TitleVariant.GrayBlue:
        return 'main-title-variant-grayblue';
      case TitleVariant.Gray:
        return 'main-title-variant-gray';
      case TitleVariant.Green:
        return 'main-title-variant-green';
      case TitleVariant.Red:
        return 'main-title-variant-red'
      case TitleVariant.Sand:
        return 'main-title-variant-sand'
      case TitleVariant.Yellow:
        return 'main-title-variant-yellow'
    }
  }
}

interface UIBindingsCallbacks {
  onSetMusicVolume: (volume: number) => void,
  onSetSfxVolume: (volume: number) => void,
  onToggleCasualMode: (value?: boolean) => void,

  // onStartGame: () => void,
  // onEnterOstMode: () => void,
  // onEnterQuoteMode: () => void,
  // onShowLeaderboard: () => void,
  // onShowSettingsMenu: () => void,
}

export class UIBindings implements UIHandler {
  private p5: P5;
  private sfx: SFXInstance;
  private gameState: GameState;
  private callbacks: UIBindingsCallbacks = {
    onSetMusicVolume: (volume: number) => { },
    onSetSfxVolume: (volume: number) => { },
    onToggleCasualMode: (value?: boolean) => { },

    // onStartGame: () => { },
    // onEnterOstMode: () => { },
    // onEnterQuoteMode: () => { },
    // onShowLeaderboard: () => { },
    // onShowSettingsMenu: () => { },
  };
  private callAction: (action: InputAction) => void;

  private sliderMusic: HTMLInputElement;
  private sliderSfx: HTMLInputElement;
  private buttonCloseSettingsMenu: HTMLButtonElement;
  private checkboxCasualMode: HTMLInputElement;

  mainMenuButtons: Record<MainMenuButton, HTMLButtonElement> = {
    [MainMenuButton.StartGame]: null,
    [MainMenuButton.OSTMode]: null,
    [MainMenuButton.QuoteMode]: null,
    [MainMenuButton.Leaderboard]: null,
    [MainMenuButton.Settings]: null,
  }
  mainMenuNavMap: UINavMapMainMenu = null;

  constructor(p5: P5, sfx: SFXInstance, gameState: GameState, callbacks: UIBindingsCallbacks, callAction: (action: InputAction) => void) {
    this.p5 = p5;
    this.sfx = sfx;
    this.gameState = gameState;
    this.callbacks = callbacks;
    this.callAction = callAction;
    this.bindElements();
    this.mainMenuNavMap = new UINavMapMainMenu(
      this.mainMenuButtons,
      [
        { button: MainMenuButton.StartGame, action: InputAction.StartGame },
        { button: MainMenuButton.OSTMode, action: InputAction.EnterOstMode },
        { button: MainMenuButton.QuoteMode, action: InputAction.EnterQuoteMode },
        { button: MainMenuButton.Leaderboard, action: InputAction.ShowLeaderboard },
        { button: MainMenuButton.Settings, action: InputAction.ShowSettingsMenu },
      ],
      callAction
    )
  }

  handleUINavigation: UINavEventHandler = (navDir) => {
    if (UI.getIsSettingsMenuShowing()) {
      return false;
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
    return false;
  }

  handleUIInteract: UIInteractHandler = () => {
    if (UI.getIsSettingsMenuShowing()) {
      return false;
    }
    if (UI.getIsMainMenuShowing()) {
      this.mainMenuNavMap.callSelected();
      return true;
    }
    return false;
  }

  handleUICancel: UICancelHandler = () => {
    return false;
  }

  refreshFieldValues() {
    const musicVolume = getMusicVolume();
    const sfxVolume = getSfxVolume();
    this.sliderMusic.value = String(musicVolume);
    this.sliderSfx.value = String(sfxVolume);
    this.checkboxCasualMode.checked = this.gameState.isCasualModeEnabled;
  }

  private bindElements = () => {
    this.mainMenuButtons[MainMenuButton.StartGame] = requireElementById<HTMLButtonElement>('ui-button-start');
    this.mainMenuButtons[MainMenuButton.OSTMode] = requireElementById<HTMLButtonElement>('ui-button-ost-mode');
    this.mainMenuButtons[MainMenuButton.QuoteMode] = requireElementById<HTMLButtonElement>('ui-button-quote-mode');
    this.mainMenuButtons[MainMenuButton.Leaderboard] = requireElementById<HTMLButtonElement>('ui-button-leaderboard');
    this.mainMenuButtons[MainMenuButton.Settings] = requireElementById<HTMLButtonElement>('ui-button-settings');

    this.mainMenuButtons[MainMenuButton.StartGame].addEventListener('click', this.handleStartGame);
    this.mainMenuButtons[MainMenuButton.OSTMode].addEventListener('click', this.handleEnterOstMode);
    this.mainMenuButtons[MainMenuButton.QuoteMode].addEventListener('click', this.handleEnterQuoteMode);
    this.mainMenuButtons[MainMenuButton.Leaderboard].addEventListener('click', this.handleShowLeaderboard);
    this.mainMenuButtons[MainMenuButton.Settings].addEventListener('click', this.handleShowSettingsMenu);

    this.buttonCloseSettingsMenu = requireElementById<HTMLButtonElement>('settings-menu-close-button');
    this.checkboxCasualMode = requireElementById<HTMLInputElement>('checkbox-casual-mode');
    this.sliderMusic = requireElementById<HTMLInputElement>("slider-volume-music");
    this.sliderSfx = requireElementById<HTMLInputElement>("slider-volume-sfx");

    this.buttonCloseSettingsMenu.addEventListener('click', this.onHideSettingsMenuClick);
    this.checkboxCasualMode.addEventListener('change', this.onCheckboxCasualModeChange);
    this.sliderMusic.addEventListener('input', this.onMusicSliderInput);
    this.sliderSfx.addEventListener('input', this.onSfxSliderInput);
    // document.addEventListener('keydown', this.overrideEscapeKeydown);
  }

  public cleanup = () => {
    this.mainMenuButtons[MainMenuButton.StartGame].removeEventListener('click', this.handleStartGame);
    this.mainMenuButtons[MainMenuButton.OSTMode].removeEventListener('click', this.handleEnterOstMode);
    this.mainMenuButtons[MainMenuButton.QuoteMode].removeEventListener('click', this.handleEnterQuoteMode);
    this.mainMenuButtons[MainMenuButton.Leaderboard].removeEventListener('click', this.handleShowLeaderboard);
    this.mainMenuButtons[MainMenuButton.Settings].removeEventListener('click', this.handleShowSettingsMenu);

    this.buttonCloseSettingsMenu.removeEventListener('click', this.onHideSettingsMenuClick);
    this.checkboxCasualMode.removeEventListener('change', this.onCheckboxCasualModeChange);
    this.sliderMusic.removeEventListener('input', this.onMusicSliderInput);
    this.sliderSfx.removeEventListener('input', this.onSfxSliderInput);
    // document.removeEventListener('keydown', this.overrideEscapeKeydown);
  }

  public setStartButtonVisibility = (visible: boolean) => {
    this.mainMenuButtons[MainMenuButton.StartGame].style.visibility = visible ? 'visible' : 'hidden';
    this.mainMenuButtons[MainMenuButton.StartGame].classList.add('active');
  }

  // private overrideEscapeKeydown = (event: KeyboardEvent) => {
  //   if (!this.gameState.isGameStarted) return;
  //   if (this.gameState.isGameWon) return;
  //   if (event.keyCode === this.p5.ESCAPE || event.code === 'Escape') {
  //     event.preventDefault();
  //   }
  // }

  private onHideSettingsMenuClick = () => {
    UI.hideSettingsMenu();
    this.sfx.play(Sound.doorOpen);
  }

  private onCheckboxCasualModeChange = (ev: InputEvent) => {
    const isCasualModeEnabled = (ev.target as HTMLInputElement).checked;
    this.callbacks.onToggleCasualMode(isCasualModeEnabled);
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
    this.callAction(InputAction.StartGame);
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
}

export class Modal implements UIHandler {
  private modal: HTMLElement;
  private title: HTMLElement;
  private message: HTMLElement;
  private buttonNo: HTMLElement;
  private buttonYes: HTMLElement;
  private handleNoClick: () => void = () => { };
  private handleYesClick: () => void = () => { };
  private isShowing: boolean = false;

  constructor() {
    this.modal = requireElementById<HTMLElement>('modal');
    this.title = requireElementById<HTMLElement>('modal-title');
    this.message = requireElementById<HTMLElement>('modal-message');
    this.buttonNo = requireElementById<HTMLElement>("modal-button-no");
    this.buttonYes = requireElementById<HTMLElement>("modal-button-yes");
  }

  cleanup = () => {
    this.hide();
  }

  getIsShowing = (): boolean => {
    return this.isShowing;
  }

  show = (title: string, message: string, handleYesClick: () => void, handleNoClick: () => void) => {
    if (this.isShowing) return;
    this.isShowing = true;
    UI.enableGameBlur();
    this.handleNoClick = handleNoClick;
    this.handleYesClick = handleYesClick;
    this.title.innerText = title;
    this.message.innerText = message;
    this.modal.classList.remove("hidden");
    this.addBindings();
    setTimeout(() => {
      this.buttonNo.focus();
    }, 0)
  }

  hide = () => {
    UI.disableGameBlur();
    this.modal.classList.add("hidden");
    this.removeBindings();
    this.isShowing = false;
  }

  handleUINavigation: UINavEventHandler = () => {
    if (!this.isShowing) return false;
    this.gotoNextOption();
    return true;
  }

  handleUIInteract: UIInteractHandler = () => {
    if (!this.isShowing) return false;
    this.onSubmit();
    return true;
  }

  handleUICancel: UICancelHandler = () => {
    if (!this.isShowing) return false;
    this.hide();
    return true;
  }

  private onNoClick = () => {
    this.handleNoClick();
  }

  private onYesClick = () => {
    this.handleYesClick();
  }

  private onSubmit = () => {
    if (!this.isShowing) return;
    if (document.activeElement === this.buttonNo) {
      this.onNoClick();
    } else {
      this.onYesClick();
    }
  }

  private gotoNextOption = () => {
    if (!this.isShowing) return;
    if (document.activeElement === this.buttonNo) {
      this.buttonYes.focus();
    } else {
      this.buttonNo.focus();
    }
  }

  private addBindings = () => {
    this.buttonNo.addEventListener("click", this.onNoClick);
    this.buttonYes.addEventListener("click", this.onYesClick);
  }

  private removeBindings = () => {
    this.buttonNo.removeEventListener("click", this.onNoClick);
    this.buttonYes.removeEventListener("click", this.onYesClick);
  }
}

export class HighscoreEntryModal implements UIHandler {
  private modal: HTMLElement;
  private form: HTMLFormElement;
  private inputName: HTMLInputElement;
  private onSubmitName: (name: string) => void = () => { }
  private isShowing: boolean = false;
  private isSubmitting: boolean = false;

  constructor() {
    this.modal = requireElementById<HTMLElement>('modal-highscore-entry');
    this.form = requireElementById<HTMLFormElement>('form-highscore-entry');
    this.inputName = requireElementById<HTMLInputElement>('input-highscore-name');
  }
  handleUINavigation: UINavEventHandler = () => {
    return false;
  };
  handleUIInteract: UIInteractHandler = () => {
    if (!this.isShowing) return false;
    this.onSubmit();
    return true;
  };
  handleUICancel: UICancelHandler = () => {
    return false;
  };

  getIsShowing = (): boolean => {
    return this.isShowing;
  }

  show = (onSubmitName: (name: string) => void, initialName?: string) => {
    if (this.isShowing) return;
    this.isShowing = true;
    UI.enableGameBlur();
    this.onSubmitName = onSubmitName;
    this.modal.classList.remove("hidden");
    this.inputName.value = initialName ? initialName : "Snek" + faker.person.firstName();
    this.inputName.focus();
    this.inputName.select();
    this.addBindings();
  }

  hide = () => {
    UI.disableGameBlur();
    this.removeBindings();
    this.modal.classList.add("hidden");
    this.isShowing = false;
  }

  private addBindings = () => {
    this.form.addEventListener('submit', this.onSubmit);
  }

  private removeBindings = () => {
    this.form.removeEventListener('submit', this.onSubmit);
  }

  private onSubmit = () => {
    if (!this.isShowing) return;
    if (this.isSubmitting) return;
    try {
      this.isSubmitting = true;
      const formData = new FormData(this.form);
      this.onSubmitName(formData.get('input-highscore-name') as string)
    } catch (err) {
      console.log(err);
    } finally {
      this.isSubmitting = false;
    }
  }
}

function requireElementById<T>(id: string) {
  const element = document.getElementById(id) as T;
  if (!element) throw new Error(`Unable to find element with id "${id}"`);
  return element;
}
