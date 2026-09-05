import P5 from 'p5';

import { getOrCreateElementById, parseElementLevelNum, requireElementById } from './uiUtils';
import { emitUIEvent } from './uiEvents';
import { DifficultyIndex, Initiator, InputAction } from '../types';
import { getWarpLevelFromNum } from '../levels/levelUtils';
import { SaveDataStore } from '../stores/SaveDataStore';
import { GameModeMenuElement } from './uiTypes';
import { BLOCK_SIZE_X, DIMENSIONS } from '@/constants';

export const UI_PARENT_ID = 'game-container';
export const UI_CANVAS_RIGHT = 'ui-canvas-right';
const GAME_ID = 'game';
const $GAME = document.getElementById('game');
const $GAME_CONTAINER = document.getElementById('game-container');
const $UI_CANVAS_RIGHT = document.getElementById('ui-canvas-right');

const LABEL_COLOR = '#fff';
const LABEL_COLOR_INVERTED = '#000';
const LABEL_BG_COLOR = 'rgb(7 11 15 / 52%)';
const LABEL_BG_COLOR_INVERTED = 'rgba(255,255,255, 0.5)';

enum ActiveMenu {
  None = 0,
  MainMenu,
  SettingsMenu,
  GameModeMenu,
  LevelSelectMenu,
}

export class UI {
  private static activeMenu = ActiveMenu.None;

  static getIsMainMenuShowing = () => UI.activeMenu === ActiveMenu.MainMenu;
  static getIsSettingsMenuShowing = () => UI.activeMenu === ActiveMenu.SettingsMenu;
  static getIsGameModeMenuShowing = () => UI.activeMenu === ActiveMenu.GameModeMenu;
  static getIsLevelSelectMenuShowing = () => UI.activeMenu === ActiveMenu.LevelSelectMenu;

  static init() {
    $GAME.style.width = String(DIMENSIONS.x) + 'px';
    $GAME.style.height = String(DIMENSIONS.y) + 'px';
    $GAME_CONTAINER.style.width = String(DIMENSIONS.x) + 'px';
    $GAME_CONTAINER.style.height = String(DIMENSIONS.y) + 'px';
    $UI_CANVAS_RIGHT.style.width = `${BLOCK_SIZE_X}px`;
  }

  static showGfxCanvas() {
   $GAME.classList.remove('hide-gfx-canvas');
  }

  static hideGfxCanvas() {
   $GAME.classList.add('hide-gfx-canvas');
  }

  static showDeathColors() {
   $GAME.classList.add('showing-death-colors');
  }

  static hideDeathColors() {
   $GAME.classList.remove('showing-death-colors');
  }

  static enableGameBlur() {
    $GAME.classList.add('blur');
  }

  static disableGameBlur() {
    $GAME.classList.remove('blur');
  }

  static hideStartScreen() {
    document.getElementById('start-screen')?.remove();
    document.getElementById('map-preview-splash')?.remove();
  }

  static showMainMenu() {
    if (UI.getIsMainMenuShowing()) {
      return;
    }
    UI.activeMenu = ActiveMenu.MainMenu;
    emitUIEvent(InputAction.ShowMainMenu, Initiator.UI);
  }

  static hideMainMenu() {
    if (UI.getIsMainMenuShowing()) {
      UI.activeMenu = ActiveMenu.None;
    }
    emitUIEvent(InputAction.HideMainMenu, Initiator.UI);
  }

  static showGameModeMenu(isCobraMode: boolean) {
    if (UI.getIsGameModeMenuShowing()) {
      return;
    }
    UI.activeMenu = ActiveMenu.GameModeMenu;
    document.getElementById('select-game-mode-menu').classList.remove('hidden');
    if (isCobraMode) {
      document.getElementById(GameModeMenuElement.LevelSelect)?.classList.add('hidden');
    } else {
      document.getElementById(GameModeMenuElement.LevelSelect)?.classList.remove('hidden');
    }
    emitUIEvent(InputAction.ShowGameModeMenu, Initiator.UI);
  }

  static hideGameModeMenu() {
    document.getElementById('select-game-mode-menu').classList.add('hidden');
    if (UI.getIsGameModeMenuShowing()) {
      UI.activeMenu = ActiveMenu.None;
    }
    emitUIEvent(InputAction.HideGameModeMenu, Initiator.UI);
  }

  static showSettingsMenu() {
    if (UI.getIsSettingsMenuShowing()) {
      return;
    }
    UI.activeMenu = ActiveMenu.SettingsMenu;
    UI.enableGameBlur();
    emitUIEvent(InputAction.ShowSettingsMenu, Initiator.UI);
  }

  static hideSettingsMenu() {
    UI.disableGameBlur();
    if (UI.getIsSettingsMenuShowing()) {
      UI.activeMenu = ActiveMenu.None;
    }
    emitUIEvent(InputAction.HideSettingsMenu, Initiator.UI);
  }

  static showLevelSelectMenu() {
    if (UI.getIsLevelSelectMenuShowing()) {
      return;
    }
    UI.activeMenu = ActiveMenu.LevelSelectMenu;
    document.getElementById('level-select-menu').classList.remove('hidden');
    emitUIEvent(InputAction.ShowLevelSelectMenu, Initiator.UI);
  }

  static hideLevelSelectMenu() {
    document.getElementById('level-select-menu').classList.add('hidden');
    if (UI.getIsLevelSelectMenuShowing()) {
      UI.activeMenu = ActiveMenu.None;
    }
    emitUIEvent(InputAction.HideLevelSelectMenu, Initiator.UI);
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

  static drawTitle(title = '', textColor = '#fff', offset: number, hasShadow: boolean, uiElements: (HTMLElement | Element)[]) {
    const p = document.createElement('p');
    for (let i = 0; i < title.length; i++) {
      const span = document.createElement('span');
      span.textContent = title[i];
      p.appendChild(span);
    }
    p.id = 'title';
    p.style.transform = 'scale(2)';
    p.style.fontSize = '6em';
    p.style.letterSpacing = '52px';
    p.style.color = textColor;
    p.style.lineHeight = '1em';
    p.style.fontFamily = "'Monofett', monospace";
    p.style.whiteSpace = 'nowrap';
    p.style.zIndex = '5';
    if (hasShadow) {
      p.style.textShadow = '6px 6px 3px black';
    }
    p.style.position = 'absolute';
    p.style.left = `${68 + offset}px`;
    p.style.top = `${5 + offset}px`;
    p.classList.add("main-title");
    document.getElementById(UI_PARENT_ID)?.appendChild(p);
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

  private static applyLevelNameStyles(
    elem: HTMLElement,
    backgroundColor: string,
    color: string
  ) {
    if (!elem) return;
    elem.style.backgroundColor = backgroundColor;
    elem.style.color = color;
    elem.classList.add('ui-label', 'level-name');
  }

  static renderLevelName(levelName = '', isInvertedColors: boolean, progress = 0) {
    const progressColor = "#ffffffdd";
    const id1 = 'level-name-field-1'
    const id2 = 'level-name-field-2'
    let elem1 = document.getElementById(id1);
    let elem2 = document.getElementById(id2);
    if (!elem1) {
      elem1 = Object.assign(document.createElement('p'), {
        id: id1,
        textContent: levelName,
      });
      document.getElementById(UI_PARENT_ID).appendChild(elem1);
    }
    if (!elem2 && progress > Number.EPSILON) {
      elem2 = Object.assign(document.createElement('p'), {
        id: id2,
        textContent: levelName,
      });
      document.getElementById(UI_PARENT_ID).appendChild(elem2);
    }
    UI.applyLevelNameStyles(elem1, isInvertedColors ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR, isInvertedColors ? LABEL_COLOR_INVERTED : LABEL_COLOR);
    UI.applyLevelNameStyles(elem2, isInvertedColors ? LABEL_COLOR_INVERTED : progressColor, isInvertedColors ? LABEL_BG_COLOR_INVERTED : "black");
    if (progress > Number.EPSILON) {
      UI.applyLevelProgressInverted(elem1, progress);
      UI.applyLevelProgress(elem2, progress);
    }
  }

  private static applyLevelProgress(elem: HTMLElement, progress: number) {
    if (!elem) return;
    const percentage = progress * 100;
    const polygon = `polygon(0% 10%, ${percentage}% 10%, ${percentage}% 90%, 0 90%)`;
    elem.style.clipPath = polygon;
    elem.style.setProperty('-webkit-clip-path', polygon);
  }

  private static applyLevelProgressInverted(elem: HTMLElement, progress: number) {
    if (!elem) return;
    const percentage = progress * 100;
    const polygon = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
    elem.style.clipPath = polygon;
    elem.style.setProperty('-webkit-clip-path', polygon);
  }

  static renderHearts(numLives = 3, isInvertedColors: boolean) {
    const containerId = "hearts-container";
    const classNameContainer = "ui-label hearts-container";
    const classNameHeart = 'ui-heart';
    const classNameDamaged = 'damaged';
    const classNameNoLivesLeft = 'no-lives-left';
    const classNameDeathInverted = 'death-inverted';
    const labelBackgroundColor = (() => {
      if (isInvertedColors) return LABEL_BG_COLOR_INVERTED;
      return numLives === 0 ? '#5c050ddb' : LABEL_BG_COLOR;
    })()
    const numHearts = 3;
    let elem = document.getElementById(containerId);
    if (!elem) {
      const div = document.createElement('div');
      for (let i = 0; i < numHearts; i++) {
        const element = document.createElement('span');
        element.className = classNameHeart;
        div.appendChild(element);
      }
      div.className = classNameContainer;
      div.id = containerId;
      document.getElementById(UI_PARENT_ID)?.appendChild(div);
      elem = document.getElementById(containerId);
    }
    if (!elem) return;
    const children = elem.getElementsByTagName('span');
    for (let i = 0; i < numHearts && i < children.length; i++) {
      if (i < numLives) {
        children[i].classList.remove(classNameDamaged);
      } else {
        children[i].classList.add(classNameDamaged);
      }
    }
    elem.style.backgroundColor = labelBackgroundColor;
    if (numLives === 0) {
      elem.classList.add(classNameNoLivesLeft);
    } else {
      elem.classList.remove(classNameNoLivesLeft);
    }
    if (isInvertedColors) {
      elem.classList.add(classNameDeathInverted);
    } else {
      elem.classList.remove(classNameDeathInverted);
    }
  }

  static renderScore(score = 0, isInvertedColors: boolean) {
    const id = 'score-field';
    const elem = getOrCreateElementById(id, 'p', 'ui-label score', UI_PARENT_ID);
    elem.innerText = String(score).padStart(8, '0');
    elem.style.color = isInvertedColors ? LABEL_COLOR_INVERTED : LABEL_COLOR;
    elem.style.backgroundColor = isInvertedColors ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR;
  }

  static renderDifficulty(difficultyIndex = 0, isInvertedColors: boolean, isCasualModeEnabled = false, isCobraModeEnabled = false) {
    const id = 'difficulty-field';
    let difficultyText = 'UNKNOWN';
    if (difficultyIndex >= 4) difficultyText = 'ULTRA';
    if (difficultyIndex >= 3) difficultyText = isCobraModeEnabled ? 'KING' : 'HARD';
    if (difficultyIndex >= 2) difficultyText = 'MEDIUM';
    if (difficultyIndex >= 1) difficultyText = 'EASY';
    if (isCasualModeEnabled) difficultyText += ' CASUAL';
    if (isCobraModeEnabled) difficultyText += ' COBRA';
    const p = getOrCreateElementById(id, 'p', 'ui-label difficulty', UI_PARENT_ID);
    p.textContent = difficultyText;
    p.style.color = isInvertedColors ? LABEL_COLOR_INVERTED : LABEL_COLOR;
    p.style.backgroundColor = isInvertedColors ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR;
    document.getElementById(UI_PARENT_ID)?.appendChild(p);
  }

  static renderCasualRewindTip() {
    const id = 'casual-rewind-tip-field';
    const p = getOrCreateElementById(id, 'p', 'ui-label casual', UI_PARENT_ID);
    p.textContent = '[DEL] rewind moves';
    p.style.position = 'absolute';
    p.style.left = '0px';
    p.style.top = '0px';
    p.style.color = LABEL_COLOR;
    p.style.backgroundColor = LABEL_BG_COLOR;
  }

  static addTooltip(textStr = '', parent: HTMLElement, align: 'left' | 'right' = 'left') {
    const element = document.createElement('span');
    element.textContent = textStr;
    element.classList.add('tooltip', `align-${align}`);
    parent.appendChild(element);
  }

  static drawButton(textStr = '', x = 0, y = 0, onClick: () => void, uiElements: HTMLElement[], {
    parentId = "game",
    tooltipText,
  }: {
    parentId?: string,
    tooltipText?: string,
  } = {}) {
    let tooltip: HTMLElement = null;
    if (tooltipText) {
      tooltip = document.createElement('span');
      tooltip.textContent = tooltipText;
      tooltip.classList.add('tooltip', 'align-left', 'invert');
    }
    const button = document.createElement('button');
    button.textContent = textStr;
    if (x >= 0 && y >= 0) {
      button.style.position = 'absolute';
      button.style.left = `${x * 2}px`;
      button.style.top = `${y * 2}px`;
    }
    button.setAttribute("tabindex", "0");
    button.style.transformOrigin ='top left';
    button.style.transform = 'scale(2)';
    button.addEventListener('click', onClick);
    if (typeof parentId === 'string') {
      if (tooltip) {
        button.appendChild(tooltip);
      }
      requireElementById<HTMLElement>(parentId).appendChild(button);
    }
    uiElements.push(button);
    return button;
  }

  static drawText(textStr = '', fontSize = '9.6px', y = 0, uiElements: HTMLElement[], { color = '#fff', width = 480, margin = '48px auto' } = {}) {
    const element = document.createElement('p');
    element.textContent = textStr;
    element.classList.add('minimood');
    element.style.fontSize = fontSize;
    element.style.color = color;
    element.style.textShadow = '0px 3px 3px black';
    element.style.padding = '0 16px';
    element.style.width = `${width}px`;
    element.style.textAlign = 'center';
    element.style.transformOrigin = 'top center';
    element.style.transform = 'scale(2)';
    element.style.position = 'absolute';
    element.style.top = `${2 * y}px`;
    element.style.left = 'initial';
    element.style.margin = margin;
    requireElementById<HTMLElement>(UI_PARENT_ID).appendChild(element);
    uiElements.push(element);
    return element.offsetHeight;
  }

  static drawDarkOverlay(uiElements: HTMLElement[]) {
    const id = 'dark-overlay';
    document.getElementById(id)?.remove();
    const div = document.createElement('div');
    div.id = id;
    div.style.position = 'absolute';
    div.style.top = '0px';
    div.style.bottom = '0px';
    div.style.left = '0px';
    div.style.right = '0px';
    div.style.margin = '-1px';
    div.style.backgroundColor = 'rgb(7 11 15 / 75%)';
    div.style.zIndex = '6';
    // div.style.mixBlendMode = 'color-burn';
    requireElementById<HTMLElement>(UI_PARENT_ID).appendChild(div);
    uiElements.push(div);
  }

  static drawScreenFlash() {
    const id = "screen-flash-overlay";
    document.getElementById(id)?.remove();
    const div = document.createElement('div');
    div.id = id;
    div.style.position = 'absolute';
    div.style.top = '0px';
    div.style.bottom = '0px';
    div.style.left = '0px';
    div.style.right = '0px';
    div.style.zIndex = '20';
    div.style.backgroundColor = '#ff550099';
    div.style.mixBlendMode = 'hard-light';
    requireElementById<HTMLElement>(UI_PARENT_ID).appendChild(div);
    return div;
  }

  static renderLevelSelectMenuCompletion(store: SaveDataStore) {
    const levelsContainer = requireElementById<HTMLDivElement>('level-select-levels');
    const levels = levelsContainer.children;
    for (const levelElem of levels) {
      const levelNum = parseElementLevelNum(levelElem as HTMLButtonElement);
      const level = getWarpLevelFromNum(levelNum);
      const completed = (difficultyIndex: DifficultyIndex) => store.getLevelCompleted(level.id, difficultyIndex);
      UI.renderLevelCompletion(levelElem as HTMLElement, completed);
    }
  }

  static renderLevelCompletion(elem: HTMLElement, completed: (difficultyIndex: DifficultyIndex) => boolean) {
    const newContainer = () => {
      const outer = document.createElement('div');
      const status = (difficulty: string, completed: boolean) => {
        const el = document.createElement('div');
        el.classList.add(difficulty);
        if (completed) el.classList.add('completed');
        return el;
      }
      outer.classList.add('completion-status')
      outer.append(status('medium', completed(2)));
      outer.append(status('hard', completed(3)));
      outer.append(status('ultra', completed(4)));
      return outer;
    }
    const existing = elem.querySelector('.completion-status');
    if (!existing) {
      elem.prepend(newContainer());
      return;
    }
    const setStatus = (difficulty: string, completed: boolean) => {
      if (completed) {
        existing.querySelector(difficulty)?.classList.add('completed');
      } else {
        existing.querySelector(difficulty)?.classList.remove('completed');
      }
    }
    setStatus('.medium', completed(2));
    setStatus('.hard', completed(3));
    setStatus('.ultra', completed(4));
  }

  static disableScreenScroll() {
    document.body.style.overflowY = "hidden";
  }

  static enableScreenScroll() {
    document.body.style.overflowY = "auto";
  }
}
