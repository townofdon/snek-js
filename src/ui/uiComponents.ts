import { UI } from "./ui";
import { ACCENT_COLOR } from '../constants';
import { saveDataStore } from "@/stores/SaveDataStore";
import { gameState } from "@/gameState";
import { GameMode } from "@/types";
import { PauseMenuElement } from "./uiNavMap";

export function showGameOverUI(loseMessage: string, uiElements: HTMLElement[]) {
  const yInit = 160;
  const padding = 72;
  UI.drawDarkOverlay(uiElements);
  UI.drawText('YOU DIED!', '22px', yInit, uiElements, { color: ACCENT_COLOR });
  const height = UI.drawText(loseMessage, '9.6px', yInit + padding, uiElements, { width: 300 });
  UI.drawText('[Press any key]', '6px', yInit + padding * 2 - 25 + height, uiElements, { width: 300, color: '#9b976c' })
}

interface ShowPauseMenuCallbacks {
  unpause: () => void,
  confirmShowTitleScreen: () => void,
  showInGameSettingsMenu: () => void,
  showWearablesMenu: () => void,
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
  const showWearablesMenuButton = true
    && gameState.gameMode !== GameMode.Arcade
    && gameState.gameMode !== GameMode.Tutorial
    && !!saveDataStore.getUnlockedWearablesList().length;
  const { unpause, confirmShowTitleScreen, showInGameSettingsMenu, showWearablesMenu } = callbacks;
  UI.drawDarkOverlay(uiElements);
  UI.drawText("PAUSED", '24px', 196, uiElements, { color: ACCENT_COLOR, className: 'title-gradient' });
  {
    const button = UI.drawButton("RESUME", 16, 16, unpause, uiElements);
    button.id = PauseMenuElement.ButtonResume;
  }
  if (confirmShowTitleScreen) {
    const button = UI.drawButton("MAIN MENU", 176, 16, confirmShowTitleScreen, uiElements);
    button.id = PauseMenuElement.ButtonMainMenu;
  }
  if (showWearablesMenuButton && showWearablesMenu) {
    const button = UI.drawButton("OUTFITS", 184, 56, showWearablesMenu, uiElements);
    button.id = PauseMenuElement.ButtonWearablesMenu;
  }
  {
    const button = UI.drawButton("SETTINGS", 356, 16, showInGameSettingsMenu, uiElements);
    button.id = PauseMenuElement.ButtonSettings;
  }
}
