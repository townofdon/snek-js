import P5, { Element, Vector } from 'p5';

const UI_LABEL_OFFSET = '18px';

const LABEL_COLOR = '#fff';
const LABEL_COLOR_INVERTED = '#000';
const LABEL_BG_COLOR = 'rgba(0,0,0, 0.5)';
const LABEL_BG_COLOR_INVERTED = 'rgba(255,255,255, 0.5)';

export class UI {
  static p5: P5;

  static setP5Instance(p5: P5) {
    UI.p5 = p5;
  }

  static drawTitle(title = '', textColor = '#fff', offset: number, hasShadow: boolean, uiElements: Element[]) {
    const p = UI.p5.createP(title);
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
    p.parent("main");
    uiElements.push(p);
  }

  static clearLabels() {
    document.getElementById('level-name-field')?.remove();
    document.getElementById('hearts-container')?.remove();
    document.getElementById('score-field')?.remove();
    document.getElementById('difficulty-field')?.remove();
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
    p.parent("main");
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
    div.parent("main");
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
    p.parent("main");
  }

  static renderDifficulty(difficultyIndex = 0, isShowingDeathColours: boolean) {
    const id = 'difficulty-field';
    const difficultyText = (() => {
      if (difficultyIndex >= 4) return 'ULTRA';
      if (difficultyIndex >= 3) return 'HARD';
      if (difficultyIndex >= 2) return 'MEDIUM';
      if (difficultyIndex >= 1) return 'EASY';
      return 'UNKNOWN'
    })()
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
    p.parent("main");
  }

  static drawButton(textStr = '', x = 0, y = 0, onClick: () => void, uiElements: Element[]) {
    const button = UI.p5.createButton(textStr);
    button.position(x, y);
    button.mousePressed(onClick);
    button.parent("main");
    uiElements.push(button);
  }

  static drawText(textStr = '', fontSize = '12px', y = 0, uiElements: Element[]) {
    const element = UI.p5.createP(textStr);
    element.addClass('minimood');
    element.style('font-size', fontSize);
    element.style('color', '#fff');
    element.style('text-shadow', '0px 3px 3px black');
    element.style('padding', '0 20px');
    element.style('width', 'calc(100% - 80px)');
    element.style('text-align', 'center');
    element.position(0, y);
    element.parent("main");
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
    div.style('background-color', 'rgb(7 11 15 / 72%)');
    // div.style('mix-blend-mode', 'color-burn');
    div.parent("main");
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
    div.parent("main");
    return div;
  }

  static disableScreenScroll() {
    document.body.style.overflowY = "hidden";
  }

  static enableScreenScroll() {
    document.body.style.overflowY = "auto";
  }
}

