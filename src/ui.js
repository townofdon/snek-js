
// eslint-disable-next-line no-unused-vars
class UI {
  static drawTitle(title, textColor, offset, hasShadow, uiElements) {
    const p = createP(title);
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

  static drawLevelName(levelName, textColor, uiElements) {
    const p = createP(levelName);
    p.position(0, 0);
    p.id('level-name-field');
    p.style('font-size', '1em');
    p.style('color', textColor);
    p.style('background-color', 'rgba(0,0,0, 0.5)');
    p.style('line-height', '1em');
    p.style('white-space', 'nowrap');
    p.style('top', 'inherit');
    p.style('left', 'inherit');
    p.style('bottom', '0');
    p.style('right', '22px');
    p.style('margin', '0');
    p.style('padding', '3px');
    p.style('padding-left', '8px');
    p.style('padding-right', '8px');
    p.style('text-align', 'right');
    p.parent("main");
    uiElements.push(p);
  }

  static renderScore(score) {
    const id = 'score-field';
    document.getElementById(id)?.remove();
    const p = createP(String(score).padStart(8, '0'));
    p.position(0, 0);
    p.id(id);
    p.style('font-size', '1em');
    p.style('color', '#fff');
    p.style('background-color', 'rgba(0,0,0, 0.5)');
    p.style('line-height', '1em');
    p.style('white-space', 'nowrap');
    p.style('top', 'inherit');
    p.style('bottom', '0');
    p.style('left', '22px');
    p.style('margin', '0');
    p.style('padding', '3px 8px');
    p.style('text-align', 'left');
    p.parent("main");
  }

  static renderDifficulty(difficultyIndex) {
    const id = 'difficulty-field';
    const difficultyText = (() => {
      if (difficultyIndex >= 4) return 'ULTRA';
      if (difficultyIndex >= 3) return 'HARD';
      if (difficultyIndex >= 2) return 'MEDIUM';
      if (difficultyIndex >= 1) return 'EASY';
    })()
    document.getElementById(id)?.remove();
    const p = createP(difficultyText);
    p.position(0, 0);
    p.id(id);
    p.style('font-size', '1em');
    p.style('color', '#fff');
    p.style('background-color', 'rgba(0,0,0, 0.5)');
    p.style('line-height', '1em');
    p.style('white-space', 'nowrap');
    p.style('left', '22px');
    p.style('margin', '0');
    p.style('padding', '1px 8px');
    p.style('text-align', 'left');
    p.parent("main");
  }

  static drawButton(textStr, x, y, onClick, uiElements) {
    const button = createButton(textStr);
    button.position(x, y);
    button.mousePressed(onClick);
    button.parent("main");
    uiElements.push(button);
  }

  static drawText(textStr, fontSize, y, uiElements) {
    const element = createP(textStr);
    element.style('font-size', fontSize);
    element.style('color', '#fff');
    element.style('text-shadow', '0px 3px 3px black');
    element.style('width', '100%');
    element.style('text-align', 'center');
    element.position(0, y);
    element.parent("main");
    uiElements.push(element);
  }

  static drawDarkOverlay(uiElements) {
    let div = createDiv();
    div.id('dark-overlay');
    div.style('position', 'absolute');
    div.style('top', '0');
    div.style('bottom', '0');
    div.style('left', '0');
    div.style('right', '0');
    div.style('background-color', 'rgb(7 11 15 / 52%)');
    div.style('mix-blend-mode', 'color-burn');
    div.parent("main");
    uiElements.push(div);
  }

  static drawScreenFlash() {
    const id = "screen-flash-overlay";
    let div = createDiv();
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

  static invertScreen() {
    UI.clearScreenInvert();
    const id = "screen-invert";
    let div = createDiv();
    div.id(id);
    div.style('position', 'absolute');
    div.style('top', '0');
    div.style('bottom', '0');
    div.style('left', '0');
    div.style('right', '0');
    div.style('z-index', '10');
    div.style('background-color', '#fff');
    div.style('mix-blend-mode', 'difference');
    div.parent("main");
    document.getElementById("main").style.mixBlendMode = 'luminosity';
  }

  static clearScreenInvert() {
    document.getElementById("screen-invert")?.remove();
    document.getElementById("main").style.mixBlendMode = 'inherit';
  }

  static renderHearts(numLives = 3, uiElements) {
    const containerId = "hearts-container";
    const className = "hearts-container";
    document.getElementById(containerId)?.remove();
    let div = createDiv();
    const numHearts = 3;
    const drawHeart = (index = 0) => {
      const element = createP(index < numLives ? "♥︎" : "♡");
      element.style('display', 'inline-block');
      element.style('font-size', 8);
      element.style('color', numLives === 0 ? '#f50' : index < numLives ? '#fff' : '#888');
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
    div.style('right', '22px');
    div.style('padding', '0 5px');
    div.style('background-color', numLives === 0 ? '#631705db' : 'rgb(7 11 15 / 52%)');
    div.class(className);
    div.id(containerId);
    div.parent("main");
    uiElements.push(div);
  }

  static disableScreenScroll() {
    document.body.style.overflowY = "hidden";
  }

  static enableScreenScroll() {
    document.body.style.overflowY = "auto";
  }
}



