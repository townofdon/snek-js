import { Element } from 'p5';
import { UI } from "./ui";
import { ACCENT_COLOR } from '../constants';
import { GameMode, GameState, Level } from '../types';
import { findLevelWarpIndex, getWarpLevelFromNum } from '../levels/levelUtils';
import { CHALLENGE_LEVELS, LEVELS, SECRET_LEVELS } from '../levels/levelConstants';

interface GameOverCallbacks {
  confirmShowMainMenu: () => void
  initLevel(shouldShowTransitions?: boolean): void
}

export function showGameOverUI(loseMessage: string, uiElements: Element[]) {
  const yInit = 160;
  const padding = 72;
  UI.drawDarkOverlay(uiElements);
  UI.drawText('YOU DIED!', '22px', yInit, uiElements, { color: ACCENT_COLOR });
  const height = UI.drawText(loseMessage, '9.6px', yInit + padding, uiElements, { width: 400 });
  UI.drawText('[Press any key]', '6px', yInit + padding * 2 - 25 + height, uiElements, { width: 400, color: '#988473' })
}

interface ShowPauseMenuOptions {
  hasWarpEnabledParam: boolean
  isWarpDisabled: boolean
  isChallengeLevel: boolean
}

interface ShowPauseMenuCallbacks {
  unpause: () => void
  confirmShowMainMenu: () => void
  showInGameSettingsMenu: () => void
  warpToLevel: (levelNum?: number) => void
}

export function showPauseUIPreviewMode(uiElements: Element[], callbacks: Pick<ShowPauseMenuCallbacks, 'unpause'>) {
  const { unpause } = callbacks;
  UI.drawDarkOverlay(uiElements);
  UI.drawText("PAUSED", '24px', 196, uiElements, { color: ACCENT_COLOR });
  UI.drawButton("RESUME", 192, 280, unpause, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonResume');
  document.getElementById('pauseButtonResume').focus();
}

export function showPauseUI(uiElements: Element[], options: ShowPauseMenuOptions, callbacks: ShowPauseMenuCallbacks) {
  const { hasWarpEnabledParam, isWarpDisabled, isChallengeLevel } = options;
  const { unpause, confirmShowMainMenu, showInGameSettingsMenu, warpToLevel } = callbacks;
  UI.drawDarkOverlay(uiElements);
  UI.drawText("PAUSED", '24px', 196, uiElements, { color: ACCENT_COLOR });
  UI.drawButton("RESUME", 16, 16, unpause, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonResume');
  UI.drawButton("MAIN MENU", 176, 16, confirmShowMainMenu, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonMainMenu');
  UI.drawButton("SETTINGS", 356, 16, showInGameSettingsMenu, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonSettings');

  if (isWarpDisabled) {
    return;
  }

  let anyWarpButtonsVisible = false;

  const warpButton = (text: string, x: number, y: number, levelNum: number, id: string) => {
    const level = getWarpLevelFromNum(levelNum);
    let levelIndex = -1;
    if (levelIndex < 0) levelIndex = LEVELS.indexOf(level);
    if (levelIndex < 0) levelIndex = CHALLENGE_LEVELS.indexOf(level);
    if (levelIndex < 0) levelIndex = SECRET_LEVELS.indexOf(level);
    const shouldShow = (() => {
      if (levelNum === 9999) return true;
      if (hasWarpEnabledParam) return true;
      if (levelIndex < 0) return false;
      // if (levelProgress < levelIndex) return false;
      return true;
    })()
    if (shouldShow) {
      const tooltipText = level.name;
      const warpFunc = levelNum === 9999
        ? () => {
          const levelName = prompt('Input level name');
          let found: Level = null;
          const iteratee = (lev: Level) => lev.name.toLowerCase() === levelName.toLowerCase();
          if (!found) found = LEVELS.find(iteratee);
          if (!found) found = CHALLENGE_LEVELS.find(iteratee);
          if (!found) found = SECRET_LEVELS.find(iteratee);
          if (found) {
            warpToLevel(findLevelWarpIndex(found));
          } else {
            alert(`could not find level "${levelName}" :(`);
          }
        }
        : () => warpToLevel(levelNum)
      UI.drawButton(text, x, y, warpFunc, uiElements, { tooltipText }).addClass('focus-invert').id(id);
      anyWarpButtonsVisible = true;
    }
  }

  if (isChallengeLevel) {
    // multiplied by 0.8 to convert from 600x600 -> 480x480
    const xInitial = 100 * 0.8;
    const offset = 80 * 0.8;
    const yRow1 = 440 * 0.8;
    const yRow2 = 480 * 0.8;
    const yRow3 = 520 * 0.8;
    const yRow4 = 560 * 0.8;
    let x = xInitial - offset;
    let y = yRow1;
    let i = 1;
    let name = () => `X${String(i++).padStart(2, "0")}`;
    warpButton(name(), x += offset, y, 417, 'pauseButtonWarpX17');
    warpButton(name(), x += offset, y, 401, 'pauseButtonWarpX01');
    warpButton(name(), x += offset, y, 402, 'pauseButtonWarpX02');
    warpButton(name(), x += offset, y, 418, 'pauseButtonWarpX18');
    warpButton(name(), x += offset, y, 403, 'pauseButtonWarpX03');
    x = xInitial - offset;
    y = yRow2;
    warpButton(name(), x += offset, y, 419, 'pauseButtonWarpX19');
    warpButton(name(), x += offset, y, 404, 'pauseButtonWarpX04');
    warpButton(name(), x += offset, y, 405, 'pauseButtonWarpX05');
    warpButton(name(), x += offset, y, 406, 'pauseButtonWarpX06');
    warpButton(name(), x += offset, y, 407, 'pauseButtonWarpX07');
    x = xInitial - offset;
    y = yRow3;
    warpButton(name(), x += offset, y, 409, 'pauseButtonWarpX09');
    warpButton(name(), x += offset, y, 410, 'pauseButtonWarpX10');
    warpButton(name(), x += offset, y, 411, 'pauseButtonWarpX11');
    warpButton(name(), x += offset, y, 412, 'pauseButtonWarpX12');
    warpButton(name(), x += offset, y, 408, 'pauseButtonWarpX08');
    x = xInitial - offset;
    y = yRow4;
    warpButton(name(), x += offset, y, 413, 'pauseButtonWarpX13');
    warpButton(name(), x += offset, y, 420, 'pauseButtonWarpX20');
    warpButton(name(), x += offset, y, 414, 'pauseButtonWarpX14');
    warpButton(name(), x += offset, y, 415, 'pauseButtonWarpX15');
    warpButton(name(), x += offset, y, 416, 'pauseButtonWarpX16');
  } else {
    const xInitial = 120 * 0.8;
    const offset = 60 * 0.8;
    const yRow1 = 400 * 0.8;
    const yRow2 = 440 * 0.8;
    const yRow3 = 480 * 0.8;
    const yRow4 = 520 * 0.8;
    const yRow5 = 560 * 0.8;
    let x = xInitial;
    warpButton("01", x + 0.00000, yRow1, 1, 'pauseButtonWarp01');
    warpButton("02", x += offset, yRow1, 2, 'pauseButtonWarp02');
    warpButton("03", x += offset, yRow1, 3, 'pauseButtonWarp03');
    warpButton("04", x += offset, yRow1, 4, 'pauseButtonWarp04');
    warpButton("05", x += offset, yRow1, 5, 'pauseButtonWarp05');
    warpButton("06", x += offset, yRow1, 6, 'pauseButtonWarp06');
    x = xInitial;
    warpButton("07", x + 0.00000, yRow2, 7, 'pauseButtonWarp07');
    warpButton("08", x += offset, yRow2, 8, 'pauseButtonWarp08');
    warpButton("09", x += offset, yRow2, 9, 'pauseButtonWarp09');
    warpButton("10", x += offset, yRow2, 10, 'pauseButtonWarp10');
    warpButton("11", x += offset, yRow2, 11, 'pauseButtonWarp11');
    warpButton("12", x += offset, yRow2, 12, 'pauseButtonWarp12');
    x = xInitial;
    warpButton("13", x + 0.00000, yRow3, 13, 'pauseButtonWarp13');
    warpButton("14", x += offset, yRow3, 14, 'pauseButtonWarp14');
    warpButton("15", x += offset, yRow3, 15, 'pauseButtonWarp15');
    warpButton("16", x += offset, yRow3, 16, 'pauseButtonWarp16');
    warpButton("17", x += offset, yRow3, 17, 'pauseButtonWarp17');
    warpButton("18", x += offset, yRow3, 18, 'pauseButtonWarp18');
    x = xInitial;
    warpButton("19", x + 0.00000, yRow4, 19, 'pauseButtonWarp19');
    warpButton("20", x += offset, yRow4, 20, 'pauseButtonWarp20');
    warpButton("99", x += offset, yRow4, 99, 'pauseButtonWarp99');
    warpButton("S1", x += offset, yRow4, 110, 'pauseButtonWarpS1');
    warpButton("S2", x += offset, yRow4, 120, 'pauseButtonWarpS2');
    warpButton("S3", x += offset, yRow4, 130, 'pauseButtonWarpS3');
    warpButton("S4", x += offset, yRow4, 140, 'pauseButtonWarpS4');
    x = xInitial;
    warpButton("M1", x + 0.00000, yRow5, 150, 'pauseButtonWarpM1');
    warpButton("M2", x += offset, yRow5, 151, 'pauseButtonWarpM2');
    warpButton("M3", x += offset, yRow5, 152, 'pauseButtonWarpM3');
    warpButton("??", x += offset, yRow5, 9999, 'pauseButtonWarp9999');
  }

  if (anyWarpButtonsVisible) {
    const yPos = isChallengeLevel ? (380 * 0.8) : (340 * 0.8)
    UI.drawText('WARP TO LEVEL', '19px', yPos, uiElements, { color: ACCENT_COLOR, margin: '38px auto' });
  }
}
