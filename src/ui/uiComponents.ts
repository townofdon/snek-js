import { Element } from 'p5';
import { UI } from "./ui";
import { ACCENT_COLOR } from '../constants';
import { GameMode, GameState, QueryParams } from '../types';

interface GameOverCallbacks {
  showMainMenu: () => void
  initLevel(shouldShowTransitions?: boolean): void
}

export function showGameOverUI(loseMessage: string, uiElements: Element[], state: GameState, callbacks: GameOverCallbacks) {
  const { showMainMenu, initLevel } = callbacks;
  UI.drawDarkOverlay(uiElements);
  UI.drawButton("MAIN MENU", 20, 20, showMainMenu, uiElements);
  if (state.gameMode !== GameMode.Cobra) {
    UI.drawButton("TRY AGAIN", 475, 20, () => initLevel(false), uiElements);
  }
  const offset = -50
  UI.drawText('YOU DIED!', '28px', 250 + offset, uiElements, { color: ACCENT_COLOR });
  UI.drawText(loseMessage, '12px', 340 + offset, uiElements);
  if (state.gameMode !== GameMode.Cobra) {
    UI.drawText('[ENTER]&nbsp;&nbsp;&nbsp;Try Again ', '14px', 450 + offset, uiElements, { color: ACCENT_COLOR });
    UI.drawText('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[M]&nbsp;&nbsp;&nbsp;Main Menu ', '14px', 480 + offset, uiElements, { color: ACCENT_COLOR, marginLeft: 16 });
  }
}

interface PauseMenuCallbacks {
  unpause: () => void
  confirmShowMainMenu: () => void
  showInGameSettingsMenu: () => void
  warpToLevel: (levelNum?: number) => void
}

export function showPauseUI(uiElements: Element[], state: GameState, queryParams: QueryParams, isStartLevel: boolean, callbacks: PauseMenuCallbacks) {
  const { unpause, confirmShowMainMenu, showInGameSettingsMenu, warpToLevel } = callbacks
  UI.drawDarkOverlay(uiElements);
  UI.drawText('PAUSED', '30px', 246, uiElements, { color: ACCENT_COLOR });
  UI.drawButton("RESUME", 20, 20, unpause, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonResume');
  UI.drawButton("MAIN MENU", 221, 20, confirmShowMainMenu, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonMainMenu');
  UI.drawButton("SETTINGS", 445, 20, showInGameSettingsMenu, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonSettings');

  if (!queryParams.enableWarp && state.gameMode !== GameMode.Casual || isStartLevel) {
    return;
  }
  UI.drawText('WARP TO LEVEL', '24px', 380, uiElements, { color: ACCENT_COLOR });
  const xInitial = 120;
  const offset = 60;
  const yRow1 = 440;
  const yRow2 = 480;
  const yRow3 = 520;
  const yRow4 = 560;
  let x = xInitial;
  UI.drawButton("01", x + 0.00000, yRow1, () => warpToLevel(1), uiElements).addClass('focus-invert').id('pauseButtonWarp01');
  UI.drawButton("02", x += offset, yRow1, () => warpToLevel(2), uiElements).addClass('focus-invert').id('pauseButtonWarp02');
  UI.drawButton("03", x += offset, yRow1, () => warpToLevel(3), uiElements).addClass('focus-invert').id('pauseButtonWarp03');
  UI.drawButton("04", x += offset, yRow1, () => warpToLevel(4), uiElements).addClass('focus-invert').id('pauseButtonWarp04');
  UI.drawButton("05", x += offset, yRow1, () => warpToLevel(5), uiElements).addClass('focus-invert').id('pauseButtonWarp05');
  UI.drawButton("06", x += offset, yRow1, () => warpToLevel(6), uiElements).addClass('focus-invert').id('pauseButtonWarp06');
  x = xInitial;
  UI.drawButton("07", x + 0.00000, yRow2, () => warpToLevel(7), uiElements).addClass('focus-invert').id('pauseButtonWarp07');
  UI.drawButton("08", x += offset, yRow2, () => warpToLevel(8), uiElements).addClass('focus-invert').id('pauseButtonWarp08');
  UI.drawButton("09", x += offset, yRow2, () => warpToLevel(9), uiElements).addClass('focus-invert').id('pauseButtonWarp09');
  UI.drawButton("10", x += offset, yRow2, () => warpToLevel(10), uiElements).addClass('focus-invert').id('pauseButtonWarp10');
  UI.drawButton("11", x += offset, yRow2, () => warpToLevel(11), uiElements).addClass('focus-invert').id('pauseButtonWarp11');
  UI.drawButton("12", x += offset, yRow2, () => warpToLevel(12), uiElements).addClass('focus-invert').id('pauseButtonWarp12');
  x = xInitial;
  UI.drawButton("13", x + 0.00000, yRow3, () => warpToLevel(13), uiElements).addClass('focus-invert').id('pauseButtonWarp13');
  UI.drawButton("14", x += offset, yRow3, () => warpToLevel(14), uiElements).addClass('focus-invert').id('pauseButtonWarp14');
  UI.drawButton("15", x += offset, yRow3, () => warpToLevel(15), uiElements).addClass('focus-invert').id('pauseButtonWarp15');
  UI.drawButton("16", x += offset, yRow3, () => warpToLevel(16), uiElements).addClass('focus-invert').id('pauseButtonWarp16');
  UI.drawButton("17", x += offset, yRow3, () => warpToLevel(17), uiElements).addClass('focus-invert').id('pauseButtonWarp17');
  UI.drawButton("18", x += offset, yRow3, () => warpToLevel(18), uiElements).addClass('focus-invert').id('pauseButtonWarp18');
  x = xInitial;
  UI.drawButton("19", x + 0.00000, yRow4, () => warpToLevel(19), uiElements).addClass('focus-invert').id('pauseButtonWarp19');
  UI.drawButton("20", x += offset, yRow4, () => warpToLevel(99), uiElements).addClass('focus-invert').id('pauseButtonWarp20');
  UI.drawButton("S1", x += offset, yRow4, () => warpToLevel(110), uiElements).addClass('focus-invert').id('pauseButtonWarpS1');
  UI.drawButton("S2", x += offset, yRow4, () => warpToLevel(120), uiElements).addClass('focus-invert').id('pauseButtonWarpS2');
  UI.drawButton("S3", x += offset, yRow4, () => warpToLevel(130), uiElements).addClass('focus-invert').id('pauseButtonWarpS3');
  UI.drawButton("S4", x += offset, yRow4, () => warpToLevel(140), uiElements).addClass('focus-invert').id('pauseButtonWarpS4');
}
