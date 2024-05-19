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
  private static prev: HTMLElement;

  static select(element: HTMLElement) {
    if (!element) return;
    if (document.activeElement && document.activeElement !== element) {
      document.activeElement.classList.remove('active');
    }
    element.focus();
    const didFocusWork = document.activeElement === element;
    if (didFocusWork) {
      element.classList.add('active');
      if (DOM.prev && DOM.prev !== element) DOM.deselect(DOM.prev);
      DOM.prev = element;
    } else {
      element.classList.remove('active');
      if (DOM.prev && DOM.prev !== element) DOM.select(DOM.prev);
    }
  }

  static deselect(element: HTMLElement) {
    if (!element) return;
    element.blur();
    element.classList.remove('active');
  }
}

export enum SettingsMenuElement {
  CheckboxCasualMode,
  CheckboxCobraMode,
  CheckboxDisableScreenshake,
  SliderMusicVolume,
  SliderSfxVolume,
  ButtonClose,
}

const SETTINGS_MENU_ELEMENT_ORDER = [
  SettingsMenuElement.CheckboxCasualMode,
  SettingsMenuElement.CheckboxCobraMode,
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
    } else if (focused === SettingsMenuElement.CheckboxCobraMode) {
      this.callAction(InputAction.ToggleCobraMode);
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
    return SETTINGS_MENU_ELEMENT_ORDER.indexOf(element);
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

export enum PauseMenuElement {
  ButtonResume = 'pauseButtonResume',
  ButtonMainMenu = 'pauseButtonMainMenu',
  ButtonSettings = 'pauseButtonSettings',
  ButtonWarp01 = 'pauseButtonWarp01',
  ButtonWarp02 = 'pauseButtonWarp02',
  ButtonWarp03 = 'pauseButtonWarp03',
  ButtonWarp04 = 'pauseButtonWarp04',
  ButtonWarp05 = 'pauseButtonWarp05',
  ButtonWarp06 = 'pauseButtonWarp06',
  ButtonWarp07 = 'pauseButtonWarp07',
  ButtonWarp08 = 'pauseButtonWarp08',
  ButtonWarp09 = 'pauseButtonWarp09',
  ButtonWarp10 = 'pauseButtonWarp10',
  ButtonWarp11 = 'pauseButtonWarp11',
  ButtonWarp12 = 'pauseButtonWarp12',
  ButtonWarp13 = 'pauseButtonWarp13',
  ButtonWarp14 = 'pauseButtonWarp14',
  ButtonWarp15 = 'pauseButtonWarp15',
  ButtonWarp16 = 'pauseButtonWarp16',
  ButtonWarp17 = 'pauseButtonWarp17',
  ButtonWarp18 = 'pauseButtonWarp18',
  ButtonWarp19 = 'pauseButtonWarp19',
  ButtonWarp20 = 'pauseButtonWarp20',
  ButtonWarpS1 = 'pauseButtonWarpS1',
  ButtonWarpS2 = 'pauseButtonWarpS2',
  ButtonWarpS3 = 'pauseButtonWarpS3',
  ButtonWarpS4 = 'pauseButtonWarpS4',
}

const PAUSE_MENU_ELEMENT_ORDER: [
  [PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
] = [
    [
      PauseMenuElement.ButtonResume,
      PauseMenuElement.ButtonMainMenu,
      PauseMenuElement.ButtonSettings,
    ],
    [
      PauseMenuElement.ButtonWarp01,
      PauseMenuElement.ButtonWarp02,
      PauseMenuElement.ButtonWarp03,
      PauseMenuElement.ButtonWarp04,
      PauseMenuElement.ButtonWarp05,
      PauseMenuElement.ButtonWarp06,
    ],
    [
      PauseMenuElement.ButtonWarp07,
      PauseMenuElement.ButtonWarp08,
      PauseMenuElement.ButtonWarp09,
      PauseMenuElement.ButtonWarp10,
      PauseMenuElement.ButtonWarp11,
      PauseMenuElement.ButtonWarp12,
    ],
    [
      PauseMenuElement.ButtonWarp13,
      PauseMenuElement.ButtonWarp14,
      PauseMenuElement.ButtonWarp15,
      PauseMenuElement.ButtonWarp16,
      PauseMenuElement.ButtonWarp17,
      PauseMenuElement.ButtonWarp18,
    ],
    [
      PauseMenuElement.ButtonWarp19,
      PauseMenuElement.ButtonWarp20,
      PauseMenuElement.ButtonWarpS1,
      PauseMenuElement.ButtonWarpS2,
      PauseMenuElement.ButtonWarpS3,
      PauseMenuElement.ButtonWarpS4,
    ],
  ]

export class PauseMenuNavMap implements NavMap {
  private callAction: (element: PauseMenuElement) => void;
  private selectedGroup = -1;
  private selectedIndex = -1;

  constructor(callAction: (element: PauseMenuElement) => void) {
    this.callAction = callAction;
  }

  callSelected = () => {
    const focused = this.getFocused();
    if (focused) this.callAction(focused);
  };

  private getFocused = (): PauseMenuElement | null => {
    if (!document.activeElement) return null;
    for (let group = 0; group < PAUSE_MENU_ELEMENT_ORDER.length; group++) {
      for (let i = 0; i < 6; i++) {
        if (!PAUSE_MENU_ELEMENT_ORDER[group] || i >= PAUSE_MENU_ELEMENT_ORDER[group].length) break;
        const target = document.getElementById(PAUSE_MENU_ELEMENT_ORDER[group][i]);
        if (target && target === document.activeElement) {
          this.selectedGroup = group;
          this.selectedIndex = i;
          return PAUSE_MENU_ELEMENT_ORDER[group][i];
        }
      }
    }
    return null;
  }

  private gotoVert = (direction: number, count = 1) => {
    const element = this.getFocused();
    if (!element
      || this.selectedGroup < 0
      || this.selectedIndex < 0
      || !PAUSE_MENU_ELEMENT_ORDER[this.selectedGroup]
      || !PAUSE_MENU_ELEMENT_ORDER[this.selectedGroup][this.selectedIndex]
    ) {
      this.gotoFirst();
      return;
    }
    const currentGroupSize = PAUSE_MENU_ELEMENT_ORDER[this.selectedGroup].length;
    const nextGroupIndex = (PAUSE_MENU_ELEMENT_ORDER.length + this.selectedGroup + direction * count) % PAUSE_MENU_ELEMENT_ORDER.length;
    const nextGroupSize = PAUSE_MENU_ELEMENT_ORDER[nextGroupIndex].length;
    const nextIndex = Math.round(this.selectedIndex * ((nextGroupSize - 1) / (currentGroupSize - 1)));
    const nextElement = PAUSE_MENU_ELEMENT_ORDER[nextGroupIndex][nextIndex];
    const node = document.getElementById(nextElement);
    if (node) DOM.select(node);
    if (!node || node !== document.activeElement) {
      if (count >= 100) {
        if (IS_DEV) console.warn("gotoVert: infinite loop was just prevented");
        return;
      }
      this.gotoVert(direction, count + 1);
    }
  }

  private gotoHoriz = (direction: number, count = 1) => {
    const element = this.getFocused();
    if (!element
      || this.selectedGroup < 0
      || this.selectedIndex < 0
      || !PAUSE_MENU_ELEMENT_ORDER[this.selectedGroup]
      || !PAUSE_MENU_ELEMENT_ORDER[this.selectedGroup][this.selectedIndex]
    ) {
      this.gotoFirst();
      return;
    }
    const currentGroupSize = PAUSE_MENU_ELEMENT_ORDER[this.selectedGroup].length;
    const nextIndex = (currentGroupSize + this.selectedIndex + direction * count) % currentGroupSize;
    const nextElement = PAUSE_MENU_ELEMENT_ORDER[this.selectedGroup][nextIndex];
    const node = document.getElementById(nextElement);
    if (node) DOM.select(node);
    if (!node || node !== document.activeElement) {
      if (count >= 100) {
        if (IS_DEV) console.warn("gotoHoriz: infinite loop was just prevented");
        return;
      }
      this.gotoHoriz(direction, count + 1);
    }
  }

  gotoFirst = () => {
    const node = document.getElementById(PAUSE_MENU_ELEMENT_ORDER[0][0]);
    if (node) DOM.select(node);
    if (node && node === document.activeElement) {
      this.selectedGroup = 0;
      this.selectedIndex = 0;
    } else {
      this.selectedGroup = -1;
      this.selectedIndex = -1;
    }
  };

  gotoCurrent = () => {
    const group = PAUSE_MENU_ELEMENT_ORDER[this.selectedGroup];
    if (!group) {
      this.gotoFirst();
      return;
    }
    const element = group[this.selectedIndex]
    if (!element) {
      this.gotoFirst();
      return;
    }
    const node = document.getElementById(element);
    if (!node) {
      this.gotoFirst();
      return;
    }
    DOM.select(node);
  }

  gotoPrev = () => {
    this.gotoHoriz(-1);
  };
  gotoNext = () => {
    this.gotoHoriz(1);
  };

  gotoUp = () => {
    this.gotoVert(-1);
  };
  gotoDown = () => {
    this.gotoVert(1);
  };
  gotoLeft = () => {
    this.gotoHoriz(-1);
  };
  gotoRight = () => {
    this.gotoHoriz(1);
  }
}
