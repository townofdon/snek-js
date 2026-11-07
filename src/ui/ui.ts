
import { getOrCreateElementById, requireElementById } from './uiUtils';
import { emitDifficultyEvent, emitLevelNameEvent, emitLevelProgressEvent, emitLivesEvent, emitScoreEvent, emitUIEvent } from './uiEvents';
import { DifficultyIndex, GameMode, Initiator, InputAction } from '../types';
import { BLOCK_SIZE_X, DIMENSIONS } from '@/constants';

export const UI_PARENT_ID = 'game-container';
export const UI_CANVAS_LEFT = 'ui-canvas-left';
export const UI_CANVAS_RIGHT = 'ui-canvas-right';
const GAME_ID = 'game';
const $MAIN = requireElementById<HTMLElement>('main');
const $GAME = document.getElementById('game');
const $GAME_CONTAINER = document.getElementById('game-container');
const $UI_CANVAS_RIGHT = document.getElementById('ui-canvas-right');

const LABEL_COLOR = '#fff';
const LABEL_BG_COLOR = 'rgb(7 11 15 / 52%)';

enum ActiveMenu {
  None = 0,
  TitleScreen,
  SettingsMenu,
  MainMenu,
  LevelSelectMenu,
  SaveSlotMenu,
  GameModeMenu,
}

export class UI {
  private static activeMenu = ActiveMenu.None;

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

  static syncSelectionToAudio(step: 1 | 2) {
    if (step === 1) {
      $MAIN.classList.remove('step-2');
      $MAIN.classList.add('step-1');
    } else {
      $MAIN.classList.remove('step-1');
      $MAIN.classList.add('step-2');
    }
  }

  static hideStartScreen() {
    document.getElementById('start-screen')?.remove();
    document.getElementById('map-preview-splash')?.remove();
    document.getElementById('main-crt')?.remove();
    document.getElementById('main-bg')?.remove();
  }

  static hideAllMenus() {
    UI.activeMenu = ActiveMenu.None;
    UI.hideTitleScreen();
    UI.hideMainMenu();
    UI.hideLevelSelectMenu();
    UI.hideSaveSlotMenu();
    UI.hideSettingsMenu();
  }

  static showTitleScreen() {
    if (UI.activeMenu === ActiveMenu.TitleScreen) {
      return;
    }
    UI.activeMenu = ActiveMenu.TitleScreen;
    emitUIEvent(InputAction.ShowTitleScreen, Initiator.UI);
  }

  static hideTitleScreen() {
    if (UI.activeMenu === ActiveMenu.TitleScreen) {
      UI.activeMenu = ActiveMenu.None;
    }
    emitUIEvent(InputAction.HideTitleScreen, Initiator.UI);
  }

  static showMainMenu() {
    if (UI.activeMenu === ActiveMenu.MainMenu) {
      return;
    }
    UI.activeMenu = ActiveMenu.MainMenu;
    emitUIEvent(InputAction.ShowMainMenu, Initiator.UI);
  }

  static hideMainMenu() {
    if (UI.activeMenu === ActiveMenu.MainMenu) {
      UI.activeMenu = ActiveMenu.None;
    }
    emitUIEvent(InputAction.HideMainMenu, Initiator.UI);
  }

  static showSettingsMenu() {
    if (UI.activeMenu === ActiveMenu.SettingsMenu) {
      return;
    }
    UI.activeMenu = ActiveMenu.SettingsMenu;
    UI.enableGameBlur();
    emitUIEvent(InputAction.ShowSettingsMenu, Initiator.UI);
  }

  static hideSettingsMenu() {
    UI.disableGameBlur();
    if (UI.activeMenu === ActiveMenu.SettingsMenu) {
      UI.activeMenu = ActiveMenu.None;
    }
    emitUIEvent(InputAction.HideSettingsMenu, Initiator.UI);
  }

  static showLevelSelectMenu() {
    if (UI.activeMenu === ActiveMenu.LevelSelectMenu) {
      return;
    }
    UI.activeMenu = ActiveMenu.LevelSelectMenu;
    emitUIEvent(InputAction.ShowLevelSelectMenu, Initiator.UI);
  }

  static hideLevelSelectMenu() {
    if (UI.activeMenu === ActiveMenu.LevelSelectMenu) {
      UI.activeMenu = ActiveMenu.None;
    }
    emitUIEvent(InputAction.HideLevelSelectMenu, Initiator.UI);
  }

  static showSaveSlotMenu() {
    if (UI.activeMenu === ActiveMenu.SaveSlotMenu) {
      return;
    }
    UI.activeMenu = ActiveMenu.SaveSlotMenu;
    emitUIEvent(InputAction.ShowSaveSlotMenu, Initiator.UI);
  }

  static hideSaveSlotMenu() {
    if (UI.activeMenu === ActiveMenu.SaveSlotMenu) {
      UI.activeMenu = ActiveMenu.None;
    }
    emitUIEvent(InputAction.HideSaveSlotMenu, Initiator.UI);
  }

  static showGameModeMenu() {
    if (UI.activeMenu === ActiveMenu.GameModeMenu) {
      return;
    }
    UI.activeMenu = ActiveMenu.GameModeMenu;
    emitUIEvent(InputAction.ShowGameModeMenu, Initiator.UI);
  }

  static hideGameModeMenu() {
    if (UI.activeMenu === ActiveMenu.GameModeMenu) {
      UI.activeMenu = ActiveMenu.None;
    }
    emitUIEvent(InputAction.HideGameModeMenu, Initiator.UI);
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
    emitUIEvent(InputAction.HideInGameUI, Initiator.UI);
  }

  static renderLevelName(levelName = '', isInvertedColors: boolean, progress = 0) {
    if (levelName.toLowerCase() !== 'init') {
      emitUIEvent(InputAction.ShowInGameUI, Initiator.UI);
    }
    emitLevelNameEvent(levelName);
    emitLevelProgressEvent(progress);
  }

  static renderHearts(numLives = 3, isInvertedColors: boolean) {
    emitLivesEvent(numLives, isInvertedColors);
  }

  static renderScore(score = 0, isInvertedColors: boolean) {
    emitScoreEvent(score);
  }

  static renderDifficulty(difficultyIndex: DifficultyIndex, isInvertedColors: boolean, gameMode: GameMode) {
    emitDifficultyEvent(difficultyIndex);
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
    element.innerHTML = textStr;
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

  static disableScreenScroll() {
    document.body.style.overflowY = "hidden";
  }

  static enableScreenScroll() {
    document.body.style.overflowY = "auto";
  }
}
