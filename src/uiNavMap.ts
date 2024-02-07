import { InputAction } from "./controls";


export interface NavMap {
  callSelected: () => void,
  gotoFirst: () => void,
  gotoPrev: () => void,
  gotoNext: () => void,
  gotoUp: () => void,
  gotoDown: () => void,
  gotoLeft: () => void,
  gotoRight: () => void,
}

export enum MainMenuButton {
  StartGame = 0,
  Settings = 1,
  Leaderboard = 2,
  QuoteMode = 3,
  OSTMode = 4,
}

/**
 * Define the nav order for main menu buttons
 */
export const MAIN_MENU_BUTTON_ORDER: MainMenuButton[] = [
  MainMenuButton.StartGame,
  MainMenuButton.OSTMode,
  MainMenuButton.QuoteMode,
  MainMenuButton.Leaderboard,
  MainMenuButton.Settings,
]

export class UINavMapMainMenu implements NavMap {
  private mainMenuButtons: Record<MainMenuButton, HTMLButtonElement> = {
    [MainMenuButton.StartGame]: null,
    [MainMenuButton.OSTMode]: null,
    [MainMenuButton.QuoteMode]: null,
    [MainMenuButton.Leaderboard]: null,
    [MainMenuButton.Settings]: null,
  };
  private actionMap: Record<MainMenuButton, InputAction>;
  private selected: (MainMenuButton | null) = null;
  private callAction: (action: InputAction) => void = null;

  constructor(
    mainMenuButtons: Record<MainMenuButton, HTMLButtonElement>,
    actionMap: Record<MainMenuButton, InputAction>,
    callAction: (action: InputAction) => void
  ) {
    this.mainMenuButtons = mainMenuButtons;
    this.actionMap = actionMap;
    this.callAction = callAction;
  }

  callSelected = () => {
    const focusedButton = this.getFocusedButton();
    if (focusedButton === null) return;
    if (focusedButton !== MainMenuButton.StartGame) {
      DOM.deselect(this.selectedTarget());
    }
    this.callAction(this.actionMap[focusedButton]);
  };

  private getFocusedButton = (): MainMenuButton | null => {
    if (!document.activeElement) return null;
    for (let i = 0; i < MAIN_MENU_BUTTON_ORDER.length; i++) {
      const target = this.mainMenuButtons[MAIN_MENU_BUTTON_ORDER[i]];
      if (target && target === document.activeElement) return MAIN_MENU_BUTTON_ORDER[i];
    }
    return null;
  }

  private getButtonPosition = (button: MainMenuButton): number => {
    for (let i = 0; i < MAIN_MENU_BUTTON_ORDER.length; i++) {
      if (MAIN_MENU_BUTTON_ORDER[i] === button) return i;
    }
    return -1;
  }

  private getNextIndex = (direction: number): number => {
    const focusedButton = this.getFocusedButton();
    if (focusedButton === null) return 0;
    const currentButtonPosition = Math.max(this.getButtonPosition(focusedButton), 0);
    return (MAIN_MENU_BUTTON_ORDER.length + currentButtonPosition + direction) % MAIN_MENU_BUTTON_ORDER.length;
  }

  private lookupElement = (button: MainMenuButton): HTMLElement | null => {
    return this.mainMenuButtons[button] || null;
  }

  private selectedTarget = (): HTMLElement | null => {
    if (this.selected === null) return null;
    return this.mainMenuButtons[this.selected] || null;
  }

  private goto = (direction: number) => {
    const nextIndex = this.getNextIndex(direction);
    const nextElement = this.lookupElement(MAIN_MENU_BUTTON_ORDER[nextIndex]);
    if (nextElement) {
      DOM.deselect(this.selectedTarget());
      this.selected = MAIN_MENU_BUTTON_ORDER[nextIndex];
      DOM.select(this.selectedTarget());
    }
  }

  gotoFirst = () => {
    const nextElement = this.lookupElement(MAIN_MENU_BUTTON_ORDER[0]);
    if (nextElement) {
      if (this.selected) DOM.deselect(this.selectedTarget());
      this.selected = MAIN_MENU_BUTTON_ORDER[0];
      DOM.select(this.selectedTarget());
    }
  };
  gotoPrev = () => {
    this.goto(-1);
  };
  gotoNext = () => {
    this.goto(1);
  };
  gotoUp = this.gotoPrev;
  gotoDown = this.gotoNext;
  gotoLeft = this.gotoPrev;
  gotoRight = this.gotoNext;
}

export class DOM {
  static select(element: HTMLElement) {
    if (!element) return;
    if (document.activeElement && document.activeElement !== element) {
      document.activeElement.classList.remove('active');
    }
    element.focus();
    element.classList.add('active');
  }

  static deselect(element: HTMLElement) {
    if (!element) return;
    element.blur();
    element.classList.remove('active');
  }
}
