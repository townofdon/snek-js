import { IS_DEV } from "./constants";
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
  StartGame,
  Settings,
  Leaderboard,
  QuoteMode,
  OSTMode,
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

export class MainMenuNavMap implements NavMap {
  private mainMenuButtons: Record<MainMenuButton, HTMLButtonElement> = {
    [MainMenuButton.StartGame]: null,
    [MainMenuButton.OSTMode]: null,
    [MainMenuButton.QuoteMode]: null,
    [MainMenuButton.Leaderboard]: null,
    [MainMenuButton.Settings]: null,
  };
  private actionMap: Record<MainMenuButton, InputAction>;
  private selected: MainMenuButton | null = null;
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
    const focused = this.getFocused();
    if (focused === null) return;
    if (focused !== MainMenuButton.StartGame) {
      DOM.deselect(this.selectedTarget());
    }
    this.callAction(this.actionMap[focused]);
  };

  private getFocused = (): MainMenuButton | null => {
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
    const focused = this.getFocused();
    if (focused === null) return 0;
    const currentButtonPosition = Math.max(this.getButtonPosition(focused), 0);
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

export enum SettingsMenuElement {
  CheckboxCasualMode,
  CheckboxDisableScreenshake,
  SliderMusicVolume,
  SliderSfxVolume,
  ButtonClose,
}

const SETTINGS_MENU_ELEMENT_ORDER = [
  SettingsMenuElement.CheckboxCasualMode,
  SettingsMenuElement.CheckboxDisableScreenshake,
  SettingsMenuElement.SliderMusicVolume,
  SettingsMenuElement.SliderSfxVolume,
  SettingsMenuElement.ButtonClose,
];

export class SettingsMenuNavMap implements NavMap {
  private elementMap: Record<SettingsMenuElement, HTMLElement>;
  private callAction: (action: InputAction) => void;

  constructor(elementMap: Record<SettingsMenuElement, HTMLElement>, callAction: (action: InputAction) => void) {
    this.elementMap = elementMap;
    this.callAction = callAction;
  }

  callSelected = () => {
    const focused = this.getFocused();
    if (focused === SettingsMenuElement.ButtonClose) {
      this.callAction(InputAction.HideSettingsMenu);
    } else if (focused === SettingsMenuElement.CheckboxCasualMode) {
      this.callAction(InputAction.ToggleCasualMode);
    } else if (focused === SettingsMenuElement.CheckboxDisableScreenshake) {
      this.callAction(InputAction.ToggleScreenshakeDisabled);
    }
  };

  private getFocused = (): SettingsMenuElement | null => {
    if (!document.activeElement) return null;
    for (let i = 0; i < SETTINGS_MENU_ELEMENT_ORDER.length; i++) {
      const target = this.elementMap[SETTINGS_MENU_ELEMENT_ORDER[i]];
      if (target && target === document.activeElement) return SETTINGS_MENU_ELEMENT_ORDER[i];
    }
    return null;
  }

  private getElementPosition = (element: SettingsMenuElement): number => {
    if (!element) return -1;
    for (let i = 0; i < SETTINGS_MENU_ELEMENT_ORDER.length; i++) {
      if (SETTINGS_MENU_ELEMENT_ORDER[i] === element) return i;
    }
    return -1;
  }

  private getNextIndex = (direction: number): number => {
    const focused = this.getFocused();
    const currentElementPosition = Math.max(this.getElementPosition(focused), 0);
    return (SETTINGS_MENU_ELEMENT_ORDER.length + currentElementPosition + direction) % SETTINGS_MENU_ELEMENT_ORDER.length;
  }

  private goto = (direction: number, count = 1) => {
    const nextIndex = this.getNextIndex(direction * count);
    const element = this.elementMap[SETTINGS_MENU_ELEMENT_ORDER[nextIndex]];
    DOM.select(element);
    // if element does not have focus, prob means it's hidden. focus on next element.
    if (!element || element !== document.activeElement) {
      // prevent infinite loop
      if (count >= 100) {
        if (IS_DEV) console.warn("getNextIndex: infinite loop was just prevented");
        return;
      }
      this.goto(direction, count + 1);
    }
  }

  gotoFirst = () => {
    const element = this.elementMap[SETTINGS_MENU_ELEMENT_ORDER[0]];
    DOM.select(element);
    if (!element || element !== document.activeElement) {
      this.goto(1);
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
