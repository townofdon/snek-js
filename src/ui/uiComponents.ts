import { Element } from 'p5';
import { UI } from "./ui";
import { ACCENT_COLOR } from '../constants';
import { GameMode, GameState } from '../types';
import { getWarpLevelFromNum } from '../levels/levelUtils';
import { LEVELS } from '../levels';

interface GameOverCallbacks {
  confirmShowMainMenu: () => void
  initLevel(shouldShowTransitions?: boolean): void
}

export function showGameOverUI(loseMessage: string, uiElements: Element[], state: GameState, callbacks: GameOverCallbacks) {
  const { confirmShowMainMenu, initLevel } = callbacks;

  const drawButtonMainMenu = (x: number, y: number) => {
    UI.drawButton("MAIN MENU", x, y, confirmShowMainMenu, uiElements).addClass('minimood').addClass('focus-invert').id('gameOverButtonMainMenu');
  }
  const drawButtonTryAgain = (x: number, y: number) => {
    UI.drawButton("TRY AGAIN", x, y, () => initLevel(false), uiElements).addClass('minimood').addClass('focus-invert').id('gameOverButtonTryAgain')
  }

  UI.drawDarkOverlay(uiElements);

  if (state.gameMode !== GameMode.Cobra) {
    drawButtonTryAgain(20, 20);
    drawButtonMainMenu(440, 20);
  }

  const offset = -50
  UI.drawText('YOU DIED!', '28px', 250 + offset, uiElements, { color: ACCENT_COLOR });
  UI.drawText(loseMessage, '12px', 340 + offset, uiElements);
}

interface ShowPauseMenuOptions {
  hasWarpEnabledParam: boolean
  isWarpDisabled: boolean
  levelProgress: number
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
  UI.drawText("PAUSED", '30px', 246, uiElements, { color: ACCENT_COLOR });
  UI.drawButton("RESUME", 241, 350, unpause, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonResume');
  document.getElementById('pauseButtonResume').focus();
}

export function showPauseUI(uiElements: Element[], options: ShowPauseMenuOptions, callbacks: ShowPauseMenuCallbacks) {
  const { levelProgress, hasWarpEnabledParam, isWarpDisabled } = options;
  const { unpause, confirmShowMainMenu, showInGameSettingsMenu, warpToLevel } = callbacks;
  UI.drawDarkOverlay(uiElements);
  UI.drawText("PAUSED", '30px', 246, uiElements, { color: ACCENT_COLOR });
  UI.drawButton("RESUME", 20, 20, unpause, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonResume');
  UI.drawButton("MAIN MENU", 221, 20, confirmShowMainMenu, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonMainMenu');
  UI.drawButton("SETTINGS", 445, 20, showInGameSettingsMenu, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonSettings');

  if (isWarpDisabled) {
    return;
  }

  let anyWarpButtonsVisible = false;

  const warpButton = (text: string, x: number, y: number, levelNum: number, id: string) => {
    const level = getWarpLevelFromNum(levelNum);
    const levelIndex = LEVELS.indexOf(level);
    const shouldShow = (() => {
      if (hasWarpEnabledParam) return true;
      if (levelIndex < 0) return false;
      if (levelProgress < levelIndex) return false;
      return true;
    })()
    if (shouldShow) {
      const tooltipText = level.name;
      UI.drawButton(text, x, y, () => warpToLevel(levelNum), uiElements, { tooltipText }).addClass('focus-invert').id(id);
      anyWarpButtonsVisible = true;
    }
  }

  const xInitial = 120;
  const offset = 60;
  const yRow1 = 440;
  const yRow2 = 480;
  const yRow3 = 520;
  const yRow4 = 560;
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
  warpButton("20", x += offset, yRow4, 99, 'pauseButtonWarp20');
  warpButton("S1", x += offset, yRow4, 110, 'pauseButtonWarpS1');
  warpButton("S2", x += offset, yRow4, 120, 'pauseButtonWarpS2');
  warpButton("S3", x += offset, yRow4, 130, 'pauseButtonWarpS3');
  warpButton("S4", x += offset, yRow4, 140, 'pauseButtonWarpS4');

  if (anyWarpButtonsVisible) {
    UI.drawText('WARP TO LEVEL', '24px', 380, uiElements, { color: ACCENT_COLOR });
  }
}
