import P5, { Element } from 'p5';
import { faker } from '@faker-js/faker';

import { GameState, IEnumerator, SFXInstance, Sound, TitleVariant } from './types';
import { getMusicVolume, getSfxVolume, setMusicVolume, setSfxVolume } from './audio';

const UI_LABEL_OFFSET = '18px';
const UI_PARENT_ID = 'game';

const LABEL_COLOR = '#fff';
const LABEL_COLOR_INVERTED = '#000';
const LABEL_BG_COLOR = 'rgba(0,0,0, 0.5)';
const LABEL_BG_COLOR_INVERTED = 'rgba(255,255,255, 0.5)';

const TITLE_VARIANT_TRANSITION_TIME_MS = 2000;

export class UI {

  private static p5: P5;

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

  static showSettingsMenu(isInGameMenu = false) {
    UI.enableGameBlur();
    const settingsMenu = document.getElementById('settings-menu');
    settingsMenu.style.display = 'block';
    settingsMenu.classList.remove('hidden');
    const gameplaySettingsSection = document.getElementById('settings-section-gameplay');
    if (isInGameMenu) {
      gameplaySettingsSection.style.display = 'none';
    } else {
      gameplaySettingsSection.style.display = 'block';
    }
  }

  static hideSettingsMenu() {
    UI.disableGameBlur();
    document.getElementById('settings-menu').style.display = 'none';
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
    document.getElementById('level-name-field')?.remove();
    document.getElementById('hearts-container')?.remove();
    document.getElementById('score-field')?.remove();
    document.getElementById('difficulty-field')?.remove();
    document.getElementById('casual-rewind-tip-field')?.remove();
  }

  static renderLevelName(levelName = '', isShowingDeathColours: boolean) {
    const id = 'level-name-field'
    document.getElementById(id)?.remove();
    const p = UI.p5.createP(levelName);
    p.position(0, 0);
    p.id(id);
    p.style('font-size', '1em');
    p.style('color', isShowingDeathColours ? LABEL_COLOR_INVERTED : LABEL_COLOR);
    p.style('background-color', isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR);
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
  onShowMainMenu: () => void;
  onSetMusicVolume: (volume: number) => void;
  onSetSfxVolume: (volume: number) => void;
}

export class UIBindings {
  private sfx: SFXInstance;
  private gameState: GameState;
  private callbacks: UIBindingsCallbacks = {
    onShowMainMenu: () => { },
    onSetMusicVolume: (volume: number) => { },
    onSetSfxVolume: (volume: number) => { },
  };

  private sliderMusic: HTMLInputElement;
  private sliderSfx: HTMLInputElement;
  private buttonCloseSettingsMenu: HTMLButtonElement;
  private buttonStartGame: HTMLButtonElement;
  private checkboxCasualMode: HTMLInputElement;

  constructor(sfx: SFXInstance, gameState: GameState, callbacks: UIBindingsCallbacks) {
    this.sfx = sfx;
    this.gameState = gameState;
    this.callbacks = callbacks;
    this.bindElements();
  }

  refreshFieldValues() {
    const musicVolume = getMusicVolume();
    const sfxVolume = getSfxVolume();
    this.sliderMusic.value = String(musicVolume);
    this.sliderSfx.value = String(sfxVolume);
    this.checkboxCasualMode.checked = this.gameState.isCasualModeEnabled;
  }

  private bindElements = () => {
    this.buttonStartGame = requireElementById<HTMLButtonElement>('start-screen-start-button');
    this.buttonStartGame.addEventListener('click', this.onButtonStartGameClick);
    this.buttonCloseSettingsMenu = requireElementById<HTMLButtonElement>('settings-menu-close-button');
    this.buttonCloseSettingsMenu.addEventListener('click', this.onHideSettingsMenuClick);
    this.checkboxCasualMode = requireElementById<HTMLInputElement>('checkbox-casual-mode');
    this.checkboxCasualMode.addEventListener('change', this.onCheckboxCasualModeChange);
    this.sliderMusic = requireElementById<HTMLInputElement>("slider-volume-music");
    this.sliderSfx = requireElementById<HTMLInputElement>("slider-volume-sfx");
    this.sliderMusic.addEventListener('input', this.onMusicSliderInput);
    this.sliderSfx.addEventListener('input', this.onSfxSliderInput);
  }

  public onButtonStartGameClick = () => {
    if (!this.gameState.isPreloaded) return;
    this.buttonStartGame.removeEventListener('click', this.onButtonStartGameClick);
    this.callbacks.onShowMainMenu();
    UI.hideStartScreen();
    this.sfx.play(Sound.doorOpen);
  }

  private onHideSettingsMenuClick = () => {
    UI.hideSettingsMenu();
    this.sfx.play(Sound.doorOpen);
  }

  private onCheckboxCasualModeChange = (ev: InputEvent) => {
    this.sfx.play(Sound.uiBlip);
    const isCasualModeEnabled = (ev.target as HTMLInputElement).checked;
    this.gameState.isCasualModeEnabled = isCasualModeEnabled;
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
}

export class Modal {
  private p5: P5;
  private modal: HTMLElement;
  private title: HTMLElement;
  private message: HTMLElement;
  private buttonNo: HTMLElement;
  private buttonYes: HTMLElement;
  private handleNoClick: () => void = () => { };
  private handleYesClick: () => void = () => { };
  private isShowing: boolean = false;

  constructor(p5: P5) {
    this.p5 = p5;
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
    this.buttonNo.focus();
    this.addBindings();
  }

  hide = () => {
    UI.disableGameBlur();
    this.modal.classList.add("hidden");
    this.removeBindings();
    this.isShowing = false;
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
    document.body.addEventListener("keydown", this.handleKeydown);
    this.buttonNo.addEventListener("click", this.onNoClick);
    this.buttonYes.addEventListener("click", this.onYesClick);
  }

  private removeBindings = () => {
    document.body.removeEventListener("keydown", this.handleKeydown);
    this.buttonNo.removeEventListener("click", this.onNoClick);
    this.buttonYes.removeEventListener("click", this.onYesClick);
  }

  private handleKeydown = (event: KeyboardEvent) => {
    if (!this.isShowing) return;
    const p5 = this.p5;
    if (event.code) {
      switch (event.code) {
        case "KeyA":
        case "ArrowLeft":
          this.gotoNextOption();
          break;
        case "KeyD":
        case "ArrowRight":
          this.gotoNextOption();
          break;
        case "Enter":
          event.preventDefault();
          event.stopPropagation();
          this.onSubmit();
          break;
      }
    } else if (event.keyCode) {
      switch (event.keyCode) {
        case p5.LEFT_ARROW:
          this.gotoNextOption();
          break;
        case p5.RIGHT_ARROW:
          this.gotoNextOption();
          break;
        case p5.ENTER:
          this.onSubmit();
          break;
      }
    }
  }
}

export class HighscoreEntryModal {
  private p5: P5;
  private modal: HTMLElement;
  private form: HTMLFormElement;
  private inputName: HTMLInputElement;
  private onSubmitName: (name: string) => void = () => { }
  private isShowing: boolean = false;
  private isSubmitting: boolean = false;

  constructor(p5: P5) {
    this.p5 = p5;
    this.modal = requireElementById<HTMLElement>('modal-highscore-entry');
    this.form = requireElementById<HTMLFormElement>('form-highscore-entry');
    this.inputName = requireElementById<HTMLInputElement>('input-highscore-name');
  }

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
    this.inputName.addEventListener('keydown', this.onKeydown);
  }

  private removeBindings = () => {
    this.form.removeEventListener('submit', this.onSubmit);
    this.inputName.removeEventListener('keydown', this.onKeydown);
  }

  private onSubmit = (event: SubmitEvent) => {
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

  private onKeydown = (event: KeyboardEvent) => {
    const p5 = this.p5;
    if (event.code) {
      switch (event.code) {
        case "Enter":
          event.preventDefault();
          event.stopPropagation();
          this.form.requestSubmit()
          break;
      }
    } else if (event.keyCode) {
      switch (event.keyCode) {
        case p5.ENTER:
          event.preventDefault();
          event.stopPropagation();
          this.form.requestSubmit()
          break;
      }
    }
  }
}

function requireElementById<T>(id: string) {
  const element = document.getElementById(id) as T;
  if (!element) throw new Error(`Unable to find element with id "${id}"`);
  return element;
}
