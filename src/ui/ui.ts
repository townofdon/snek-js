import P5, { Element } from 'p5';

import { DOM } from './uiUtils';

const UI_LABEL_OFFSET = '36px';
const UI_PARENT_ID = 'game';

const LABEL_COLOR = '#fff';
const LABEL_COLOR_INVERTED = '#000';
// const LABEL_BG_COLOR = 'rgba(0,0,0, 0.5)';
const LABEL_BG_COLOR = 'rgb(7 11 15 / 52%)';
// const LABEL_BG_COLOR = 'radial-gradient(circle, rgba(0,0,0,0.4990371148459384) 0%, rgba(0,0,0,0.4430147058823529) 18%, rgba(68,138,227,0) 100%)';
const LABEL_BG_COLOR_INVERTED = 'rgba(255,255,255, 0.5)';


enum ActiveMenu {
  None,
  MainMenu,
  SettingsMenu,
  GameModeMenu,
}

export class UI {

  private static p5: P5;
  private static activeMenu = ActiveMenu.None;

  static getIsMainMenuShowing = () => UI.activeMenu === ActiveMenu.MainMenu;
  static getIsSettingsMenuShowing = () => UI.activeMenu === ActiveMenu.SettingsMenu;
  static getIsGameModeMenuShowing = () => UI.activeMenu === ActiveMenu.GameModeMenu;

  static setP5Instance(p5: P5) {
    UI.p5 = p5;
  }

  static showGfxCanvas() {
    document.getElementById('game').classList.remove('hide-gfx-canvas');
  }

  static hideGfxCanvas() {
    document.getElementById('game').classList.add('hide-gfx-canvas');
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
    document.getElementById('start-screen')?.remove();
    document.getElementById('map-preview-splash')?.remove();
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
    UI.activeMenu = ActiveMenu.MainMenu;
  }

  static hideMainMenu() {
    document.getElementById('main-ui-buttons').classList.add('hidden');
    if (UI.getIsMainMenuShowing()) {
      UI.activeMenu = ActiveMenu.None;
    }
  }

  static showGameModeMenu() {
    document.getElementById('select-game-mode-menu').classList.remove('hidden');
    UI.activeMenu = ActiveMenu.GameModeMenu;
  }

  static hideGameModeMenu() {
    document.getElementById('select-game-mode-menu').classList.add('hidden');
    if (UI.getIsGameModeMenuShowing()) {
      UI.activeMenu = ActiveMenu.None;
    }
  }

  static showSettingsMenu({ isInGameMenu = false, isCobraModeUnlocked = false }) {
    UI.enableGameBlur();
    const settingsMenu = document.getElementById('settings-menu');
    settingsMenu.style.display = 'block';
    settingsMenu.classList.remove('hidden');
    const fieldCasualMode = document.getElementById('field-casual-mode');
    const fieldCobraMode = document.getElementById('field-cobra-mode');
    if (isInGameMenu) {
      fieldCasualMode.classList.add('hidden');
      fieldCobraMode.classList.add('hidden');
    } else {
      fieldCasualMode.classList.remove('hidden');
      if (isCobraModeUnlocked) {
        fieldCobraMode.classList.remove('hidden');
      } else {
        fieldCobraMode.classList.add('hidden');
      }
    }
    UI.activeMenu = ActiveMenu.SettingsMenu;
    setTimeout(() => {
      if (isInGameMenu) {
        DOM.select(document.getElementById('checkbox-disable-screenshake'));
      } else {
        DOM.select(document.getElementById('checkbox-casual-mode'));
      }
    }, 0)
  }

  static hideSettingsMenu() {
    UI.disableGameBlur();
    document.getElementById('settings-menu').style.display = 'none';
    if (UI.getIsSettingsMenuShowing()) {
      UI.activeMenu = ActiveMenu.None;
    }
  }

  static showMainCasualModeLabel() {
    const label = document.getElementById('main-menu-label-casual-mode');
    label.classList.remove('hidden');
    UI.hideMainCobraModeLabel();
  }

  static hideMainCasualModeLabel() {
    const label = document.getElementById('main-menu-label-casual-mode');
    label.classList.add('hidden');
  }

  static showMainCobraModeLabel() {
    const label = document.getElementById('main-menu-label-cobra-mode');
    label.classList.remove('hidden');
    UI.hideMainCasualModeLabel();
  }

  static hideMainCobraModeLabel() {
    const label = document.getElementById('main-menu-label-cobra-mode');
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
    UI.p5.scale(2);
    p.id('title');
    p.style('font-size', '6em');
    p.style('letter-spacing', '65px');
    p.style('color', textColor);
    p.style('line-height', '1em');
    p.style('font-family', "'Monofett', monospace");
    p.style('white-space', 'nowrap');
    p.style('z-index', '5');
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
    const progressColor = "#ffffffdd";
    const id1 = 'level-name-field-1'
    const id2 = 'level-name-field-2'
    const elem1 = document.getElementById(id1);
    const elem2 = document.getElementById(id2);
    if (elem1 && elem2) {
      elem1.style.backgroundColor = isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR;
      elem2.style.backgroundColor = isShowingDeathColours ? LABEL_COLOR_INVERTED : progressColor;
      elem1.style.color = isShowingDeathColours ? LABEL_COLOR_INVERTED : LABEL_COLOR;
      elem2.style.color = isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : "black";
      const p1 = new P5.Element(elem1, UI.p5);
      const p2 = new P5.Element(elem2, UI.p5);
      if (progress > Number.EPSILON) {
        UI.applyLevelProgressInverted(p1, progress);
        UI.applyLevelProgress(p2, progress);
      }
      return;
    }
    elem1?.remove()
    elem2?.remove()
    const p1 = UI.p5.createP(levelName).id(id1);
    const p2 = progress > Number.EPSILON ? UI.p5.createP(levelName).id(id2) : null;
    const applyStyles = (p: P5.Element | null, backgroundColor: string, color: string) => {
      if (!p) return;
      // p.position(0, 0);
      // p.style('font-size', '1em');
      p.style('background-color', backgroundColor);
      p.style('color', color);
      // p.style('line-height', '1em');
      // p.style('white-space', 'nowrap');
      // p.style('top', 'inherit');
      // p.style('left', 'inherit');
      // p.style('bottom', '0');
      // p.style('right', UI_LABEL_OFFSET);
      // p.style('margin', '0');
      // p.style('padding', '1px 8px');
      // p.style('text-align', 'right');
      // p.style('z-index', '5');
      // p.style('transform-origin', 'bottom right');
      // p.style('transform', 'scale(2)');
      p.class('ui-label level-name');
      p.parent(UI_PARENT_ID);
    }
    applyStyles(p1, isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR, isShowingDeathColours ? LABEL_COLOR_INVERTED : LABEL_COLOR);
    applyStyles(p2, isShowingDeathColours ? LABEL_COLOR_INVERTED : progressColor, isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : "black");
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
    const className = "ui-label hearts-container";
    const getLabelColor = (index: number) => {
      if (isShowingDeathColours) return LABEL_COLOR_INVERTED;
      if (numLives === 0) return '#f50';
      if (index < numLives) return '#fff';
      return '#888';
    }
    const labelBackgroundColor = (() => {
      if (isShowingDeathColours) return LABEL_COLOR_INVERTED;
      // return numLives === 0 ? '#631705db' : 'rgb(7 11 15 / 52%)';
      return numLives === 0 ? '#631705db' : LABEL_BG_COLOR;
    })()
    const numHearts = 3;
    const elem = document.getElementById(containerId);
    if (elem) {
      const children = elem.getElementsByTagName('p');
      for (let i = 0; i < numHearts && i < children.length; i++) {
        children[i].innerHTML = i < numLives ? "♥︎" : "♡";
        children[i].style.color = getLabelColor(i);
      }
      elem.style.backgroundColor = labelBackgroundColor;
      return;
    }
    let div = UI.p5.createDiv();
    const drawHeart = (index = 0) => {
      const element = UI.p5.createP(index < numLives ? "♥︎" : "♡");
      element.style('color', getLabelColor(index));
      // element.style('display', 'inline-block');
      // element.style('font-size', '15px');
      // element.style('text-shadow', '0px 3px 3px black');
      // element.style('text-align', 'center');
      // element.style('margin', '0 8px');
      // element.class
      element.parent(div);
    }
    for (let i = 0; i < numHearts; i++) {
      drawHeart(i);
    }
    // div.position(0, 0);
    // div.style('left', 'inherit');
    // div.style('right', UI_LABEL_OFFSET);
    // div.style('padding', '0 5px');
    div.style('background-color', labelBackgroundColor);
    // div.style('z-index', '5');
    // div.style('transform-origin', 'top right');
    // div.style('transform', 'scale(2)');
    div.class(className);
    div.id(containerId);
    div.parent(UI_PARENT_ID);
  }

  static renderScore(score = 0, isShowingDeathColours: boolean) {
    const id = 'score-field';
    const elem = document.getElementById(id);
    if (elem) {
      elem.innerText = String(score).padStart(8, '0');
      elem.style.color = isShowingDeathColours ? LABEL_COLOR_INVERTED : LABEL_COLOR;
      elem.style.backgroundColor = isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR;
      return;
    }
    const p = UI.p5.createP(String(score).padStart(8, '0'));
    // p.position(0, 0);
    p.id(id);
    p.style('color', isShowingDeathColours ? LABEL_COLOR_INVERTED : LABEL_COLOR);
    p.style('background-color', isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR);
    // p.style('font-size', '1em');
    // p.style('line-height', '1em');
    // p.style('white-space', 'nowrap');
    // p.style('top', 'inherit');
    // p.style('bottom', '0');
    // p.style('left', UI_LABEL_OFFSET);
    // p.style('margin', '0');
    // p.style('padding', '1px 8px');
    // p.style('text-align', 'left');
    // p.style('z-index', '5');
    // p.style('transform-origin', 'bottom left');
    // p.style('transform', 'scale(2)');
    p.class('ui-label score');
    p.parent(UI_PARENT_ID);
  }

  static renderDifficulty(difficultyIndex = 0, isShowingDeathColours: boolean, isCasualModeEnabled = false, isCobraModeEnabled = false) {
    const id = 'difficulty-field';
    const difficultyText = (() => {
      if (difficultyIndex >= 4) return 'ULTRA';
      if (difficultyIndex >= 3) return isCobraModeEnabled ? 'KING' : 'HARD';
      if (difficultyIndex >= 2) return 'MEDIUM';
      if (difficultyIndex >= 1) return 'EASY';
      return 'UNKNOWN'
    })() + (isCasualModeEnabled ? ' CASUAL' : '') + (isCobraModeEnabled ? ' COBRA' : '');
    document.getElementById(id)?.remove();
    const p = UI.p5.createP(difficultyText);
    // p.position(0, 0);
    p.id(id);
    p.style('color', isShowingDeathColours ? LABEL_COLOR_INVERTED : LABEL_COLOR);
    p.style('background-color', isShowingDeathColours ? LABEL_BG_COLOR_INVERTED : LABEL_BG_COLOR);
    // p.style('font-size', '1em');
    // p.style('line-height', '1em');
    // p.style('white-space', 'nowrap');
    // p.style('left', UI_LABEL_OFFSET);
    // p.style('margin', '0');
    // p.style('padding', '1px 8px');
    // p.style('text-align', 'left');
    // p.style('z-index', '5');
    // p.style('transform-origin', 'top left');
    // p.style('transform', 'scale(2)');
    p.class('ui-label difficulty');
    p.parent(UI_PARENT_ID);
  }

  static renderCasualRewindTip() {
    const id = 'casual-rewind-tip-field';
    document.getElementById(id)?.remove();
    const p = UI.p5.createP('[DEL] rewind moves');
    p.position(0, 0);
    p.id(id);
    p.style('color', LABEL_COLOR);
    p.style('background-color', LABEL_BG_COLOR);
    // p.style('font-size', '1em');
    // p.style('line-height', '1em');
    // p.style('white-space', 'nowrap');
    // p.style('left', 'inherit');
    // p.style('right', UI_LABEL_OFFSET);
    // p.style('margin', '0');
    // p.style('padding', '1px 8px');
    // p.style('text-align', 'right');
    // p.style('transform-origin', 'top right');
    // p.style('transform', 'scale(2)');
    p.addClass('ui-label casual')
    p.parent(UI_PARENT_ID);
  }

  static addTooltip(textStr = '', parent: P5.Element, align: 'left' | 'right' = 'left') {
    const element = UI.p5.createSpan(textStr).addClass("tooltip").addClass(`align-${align}`);
    element.parent(parent);
  }

  static drawButton(textStr = '', x = 0, y = 0, onClick: () => void, uiElements: Element[], {
    parentId = "game",
    tooltipText,
  }: {
    parentId?: string | P5.Element,
    tooltipText?: string,
  } = {}) {
    const tooltip = tooltipText ? UI.p5.createSpan(tooltipText).addClass('tooltip align-left invert') : null;
    const button = UI.p5.createButton(textStr);
    if (x >= 0 && y >= 0) {
      button.position(x * 2, y * 2);
    }
    button.mousePressed(onClick);
    button.parent(parentId);
    if (tooltip) {
      tooltip.parent(button);
    }
    button.attribute("tabindex", "0");
    button.style('transform-origin', 'top left');
    button.style('transform', 'scale(2)');
    uiElements.push(button);
    return button;
  }

  static drawText(textStr = '', fontSize = '12px', y = 0, uiElements: Element[], { color = '#fff', width = 600, margin = '60px auto' } = {}) {
    const element = UI.p5.createP(textStr);
    element.addClass('minimood');
    element.style('font-size', fontSize);
    element.style('color', color);
    element.style('text-shadow', '0px 3px 3px black');
    element.style('padding', '0 20px');
    element.style('width', `${width}px`);
    element.style('text-align', 'center');
    element.style('transform-origin', 'top center');
    element.style('transform', 'scale(2)');
    element.position(0, 2 * y);
    element.style('left', 'initial');
    element.style('margin', margin);
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
    div.style('z-index', '5');
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
