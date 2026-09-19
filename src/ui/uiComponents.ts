import { UI } from "./ui";
import { ACCENT_COLOR } from '../constants';
import { Level } from '../types';
import { findLevelWarpIndex, getWarpLevelFromNum } from '../levels/levelUtils';
import { CHALLENGE_LEVELS, LEVELS, SECRET_LEVELS } from '../levels/levelConstants';

interface GameOverCallbacks {
  confirmShowMainMenu: () => void
  initLevel(shouldShowTransitions?: boolean): void
}

export function showGameOverUI(loseMessage: string, uiElements: HTMLElement[]) {
  const yInit = 160;
  const padding = 72;
  UI.drawDarkOverlay(uiElements);
  UI.drawText('YOU DIED!', '22px', yInit, uiElements, { color: ACCENT_COLOR });
  const height = UI.drawText(loseMessage, '9.6px', yInit + padding, uiElements, { width: 400 });
  UI.drawText('[Press any key]', '6px', yInit + padding * 2 - 25 + height, uiElements, { width: 400, color: '#988473' })
}

interface ShowPauseMenuCallbacks {
  unpause: () => void
  confirmShowMainMenu: () => void
  showInGameSettingsMenu: () => void
}

export function showPauseUIPreviewMode(uiElements: HTMLElement[], callbacks: Pick<ShowPauseMenuCallbacks, 'unpause'>) {
  const { unpause } = callbacks;
  UI.drawDarkOverlay(uiElements);
  UI.drawText("PAUSED", '24px', 196, uiElements, { color: ACCENT_COLOR });
  const button = UI.drawButton("RESUME", 192, 280, unpause, uiElements)
  button.classList.add('minimood', 'focus-invert');
  button.id = 'pauseButtonResume';
  button.focus();
}

export function showPauseUI(uiElements: HTMLElement[], callbacks: ShowPauseMenuCallbacks) {
  const { unpause, confirmShowMainMenu, showInGameSettingsMenu } = callbacks;
  UI.drawDarkOverlay(uiElements);
  UI.drawText("PAUSED", '24px', 196, uiElements, { color: ACCENT_COLOR });
  {
    const button = UI.drawButton("RESUME", 16, 16, unpause, uiElements)
    button.classList.add('minimood', 'focus-invert');
    button.id = 'pauseButtonResume';
  }
  {
    const button = UI.drawButton("MAIN MENU", 176, 16, confirmShowMainMenu, uiElements)
    button.classList.add('minimood', 'focus-invert');
    button.id = 'pauseButtonMainMenu';
  }
  {
    const button = UI.drawButton("SETTINGS", 356, 16, showInGameSettingsMenu, uiElements)
    button.classList.add('minimood', 'focus-invert')
    button.id = 'pauseButtonSettings';
  }
}
