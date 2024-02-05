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
export const MAIN_MENU_BUTTONS: MainMenuButton[] = [
  MainMenuButton.StartGame,
  MainMenuButton.OSTMode,
  MainMenuButton.QuoteMode,
  MainMenuButton.Leaderboard,
  MainMenuButton.Settings,
]

export interface MainMenuNavElement {
  button: MainMenuButton,
  action: InputAction,
}
export interface UINavMapMainMenuConstructorArgs {
  mainMenuButtons: Record<MainMenuButton, HTMLButtonElement>,
  elements: MainMenuNavElement[],
}
export class UINavMapMainMenu implements NavMap {
  private mainMenuButtons: Record<MainMenuButton, HTMLButtonElement> = {
    [MainMenuButton.StartGame]: null,
    [MainMenuButton.OSTMode]: null,
    [MainMenuButton.QuoteMode]: null,
    [MainMenuButton.Leaderboard]: null,
    [MainMenuButton.Settings]: null,
  };
  private elements: MainMenuNavElement[] = []
  private selected: MainMenuNavElement = null;
  private callAction: (action: InputAction) => void = null;

  constructor(
    mainMenuButtons: Record<MainMenuButton, HTMLButtonElement>,
    elements: MainMenuNavElement[],
    callAction: (action: InputAction) => void
  ) {
    this.elements = elements;
    this.mainMenuButtons = mainMenuButtons;
    this.callAction = callAction;
  }

  callSelected = () => {
    const focusedElement = this.getFocusedElement();
    if (!focusedElement) return;
    if (focusedElement.button !== MainMenuButton.StartGame) {
      DOM.deselect(this.selectedTarget());
    }
    this.callAction(focusedElement.action);
  };

  private getFocusedElement = (): MainMenuNavElement | null => {
    if (!document.activeElement) return null;
    for (let i = 0; i < this.elements.length; i++) {
      const target = this.mainMenuButtons[this.elements[i].button];
      if (target && target === document.activeElement) return this.elements[i];
    }
    return null;
  }

  private getButtonPosition = (button: MainMenuButton): number => {
    for (let i = 0; i < MAIN_MENU_BUTTONS.length; i++) {
      if (MAIN_MENU_BUTTONS[i] === button) return i;
    }
    return -1;
  }

  private getNextIndex = (direction: number): number => {
    const focusedElement = this.getFocusedElement();
    if (!focusedElement) return 0;
    const currentButtonPosition = Math.max(this.getButtonPosition(focusedElement.button), 0);
    return (MAIN_MENU_BUTTONS.length + currentButtonPosition + direction) % MAIN_MENU_BUTTONS.length;
  }

  private lookupElement = (button: MainMenuButton): MainMenuNavElement | null => {
    for (let i = 0; i < this.elements.length; i++) {
      if (this.elements[i].button === button) return this.elements[i];
    }
    return null;
  }

  private selectedTarget = (): HTMLElement | null => {
    if (!this.selected) return null;
    return this.mainMenuButtons[this.selected.button] || null;
  }

  private goto = (direction: number) => {
    const nextIndex = this.getNextIndex(direction);
    const nextElement = this.lookupElement(MAIN_MENU_BUTTONS[nextIndex]);
    if (nextElement) {
      DOM.deselect(this.selectedTarget());
      this.selected = nextElement;
      DOM.select(this.selectedTarget());
    }
  }

  gotoFirst = () => {
    const nextElement = this.lookupElement(MAIN_MENU_BUTTONS[0]);
    if (nextElement) {
      if (this.selected) DOM.deselect(this.selectedTarget());
      this.selected = nextElement;
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
