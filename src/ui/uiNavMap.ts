import { IS_DEV } from "../constants";
import { InputAction } from "../types";
import { GameModeMenuElement } from "./uiTypes";
import { DOM } from "./uiUtils";


export interface NavMap {
  callSelected: () => boolean,
  gotoFirst: () => boolean,
  gotoPrev: () => boolean,
  gotoNext: () => boolean,
  gotoUp: () => boolean,
  gotoDown: () => boolean,
  gotoLeft: () => boolean,
  gotoRight: () => boolean,
}

interface GroupedNavMapOptions {
  preventScroll?: boolean
}

export abstract class GroupedNavMap<ElementType extends string> implements NavMap {
  private readonly callAction: (element: ElementType) => void;
  private readonly ORDER: ElementType[][]
  private opts: GroupedNavMapOptions

  private selectedGroup = -1;
  private selectedIndex = -1;

  constructor(callAction: (element: ElementType) => void, order: ElementType[][], opts?: GroupedNavMapOptions) {
    this.callAction = callAction;
    this.ORDER = order;
    this.opts = opts || {}
  }

  callSelected = () => {
    const focused = this.getFocused();
    if (focused) this.callAction(focused);
    return !!focused;
  };

  getActiveElement = (): Element | null => {
    const focused = this.getFocused();
    if (!focused) return null;
    return document.activeElement || null;
  }

  getActiveIndex = (): [number, number] => {
    if (!document.activeElement) return [-1, -1];
    const ORDER = this.ORDER;
    for (let group = 0; group < ORDER.length; group++) {
      if (!ORDER[group]?.length) continue;
      for (let i = 0; i < ORDER[group].length; i++) {
        const target = document.getElementById(ORDER[group][i]);
        if (target && target === document.activeElement) {
          return [group, i]
        }
      }
    }
    return [-1, -1];
  }

  private getFocused = (): ElementType | null => {
    if (!document.activeElement) return null;
    const ORDER = this.ORDER;
    for (let group = 0; group < ORDER.length; group++) {
      if (!ORDER[group]?.length) continue;
      for (let i = 0; i < ORDER[group].length; i++) {
        const target = document.getElementById(ORDER[group][i]);
        if (target && target === document.activeElement) {
          this.selectedGroup = group;
          this.selectedIndex = i;
          return ORDER[group][i];
        }
      }
    }
    return null;
  }

  private gotoVert = (direction: number, count = 1): boolean => {
    const ORDER = this.ORDER;
    const element = this.getFocused();
    if (!element
      || this.selectedGroup < 0
      || this.selectedIndex < 0
      || !ORDER[this.selectedGroup]
      || !ORDER[this.selectedGroup][this.selectedIndex]
    ) {
      return this.gotoFirst();
    }
    const currentGroupSize = ORDER[this.selectedGroup].length;
    const nextGroupIndex = (ORDER.length + this.selectedGroup + direction * count) % ORDER.length;
    const nextGroupSize = ORDER[nextGroupIndex].length;
    const nextIndex = Math.round(this.selectedIndex * ((nextGroupSize - 1) / (currentGroupSize - 1)));
    const nextElement = ORDER[nextGroupIndex][nextIndex];
    const didSelect = (elem: HTMLElement | null) => !!elem && elem === document.activeElement
    let node = document.getElementById(nextElement);
    DOM.select(node, this.opts.preventScroll);
    if (!didSelect(node)) {
      // search in both directions from nextIndex, finding first selectable node
      let i0 = nextIndex;
      let i1 = nextIndex;
      while (!didSelect(node) && (i0 >= 0 || i1 < nextGroupSize)) {
        if (i0 >= 0) {
          node = document.getElementById(ORDER[nextGroupIndex][i0]);
          DOM.select(node, this.opts.preventScroll);
        }
        if (!didSelect(node) && i1 < nextGroupSize) {
          node = document.getElementById(ORDER[nextGroupIndex][i1]);
          DOM.select(node, this.opts.preventScroll);
        }
        i0--;
        i1++;
      }
    }
    if (!didSelect(node)) {
      if (nextGroupIndex === this.selectedGroup) {
        return false;
      }
      if (count >= 100) {
        if (IS_DEV) console.warn("gotoVert: infinite loop was just prevented");
        return false;
      }
      return this.gotoVert(direction, count + 1);
    }
    if (didSelect(node)) {
      this.selectedGroup = nextGroupIndex;
      this.selectedIndex = nextIndex;
      return true;
    }
    return false;
  }

  private gotoHoriz = (direction: number, count = 1): boolean => {
    const ORDER = this.ORDER;
    const element = this.getFocused();
    if (!element
      || this.selectedGroup < 0
      || this.selectedIndex < 0
      || !ORDER[this.selectedGroup]
      || !ORDER[this.selectedGroup][this.selectedIndex]
    ) {
      return this.gotoFirst();
    }
    const currentGroupSize = ORDER[this.selectedGroup].length;
    const nextIndex = (currentGroupSize + this.selectedIndex + direction * count) % currentGroupSize;
    const nextElement = ORDER[this.selectedGroup][nextIndex];
    const didSelect = (elem: HTMLElement | null) => !!elem && elem === document.activeElement
    const node = document.getElementById(nextElement);
    if (node) DOM.select(node, this.opts.preventScroll);
    if (!didSelect(node)) {
      if (count >= 100) {
        if (IS_DEV) console.warn("gotoHoriz: infinite loop was just prevented");
        return false;
      }
      return this.gotoHoriz(direction, count + 1);
    }
    if (didSelect(node)) {
      this.selectedIndex = nextIndex;
      return true;
    }
    return false;
  }

  gotoFirst = (): boolean => {
    const didSelect = (elem: HTMLElement | null) => !!elem && elem === document.activeElement
    let node = document.getElementById(this.ORDER[0][0]);
    DOM.select(node, this.opts.preventScroll);
    if (!didSelect(node)) {
      for (let group = 0; group < this.ORDER.length && !didSelect(node); group++) {
        for (let index = 0; index < this.ORDER[group].length && !didSelect(node); index++) {
          node = document.getElementById(this.ORDER[group][index]);
          DOM.select(node, this.opts.preventScroll);
        }
      }
    }
    if (didSelect(node)) {
      this.selectedGroup = 0;
      this.selectedIndex = 0;
      return true;
    } else {
      this.selectedGroup = -1;
      this.selectedIndex = -1;
      return false;
    }
  };

  gotoCurrent = (): boolean => {
    const didSelect = (elem: HTMLElement) => !!elem && elem === document.activeElement
    if (
      !this.ORDER[this.selectedGroup] ||
      !this.ORDER[this.selectedGroup][this.selectedIndex]
    ) {
      return this.gotoFirst();
    }
    const group = this.ORDER[this.selectedGroup];
    const element = group[this.selectedIndex]
    const node = document.getElementById(element);
    if (!node) {
      return this.gotoFirst();
    }
    DOM.select(node, this.opts.preventScroll);
    if (!didSelect(node)) {
      return this.gotoFirst();
    }
    return true;
  }

  gotoPrev = () => {
    return this.gotoHoriz(-1);
  };
  gotoNext = () => {
    return this.gotoHoriz(1);
  };

  gotoUp = () => {
    return this.gotoVert(-1);
  };
  gotoDown = () => {
    return this.gotoVert(1);
  };
  gotoLeft = () => {
    return this.gotoHoriz(-1);
  };
  gotoRight = () => {
    return this.gotoHoriz(1);
  }
}

export enum MainMenuButton {
  StartGame,
  QuitGame,
  Settings,
  Leaderboard,
  QuoteMode,
  OSTMode,
  Community,
}

/**
 * Define the nav order for main menu buttons
 */
export const MAIN_MENU_BUTTON_ORDER: MainMenuButton[] = [
  MainMenuButton.StartGame,
  MainMenuButton.QuitGame,
  MainMenuButton.OSTMode,
  MainMenuButton.QuoteMode,
  MainMenuButton.Community,
  MainMenuButton.Leaderboard,
  MainMenuButton.Settings,
]

export class MainMenuNavMap implements NavMap {
  private readonly mainMenuButtons: Record<MainMenuButton, HTMLButtonElement>;
  private readonly actionMap: Record<MainMenuButton, InputAction>;
  private readonly callAction: (action: InputAction) => void;

  private selected: MainMenuButton | null = null;

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
    if (focused === null) return false;
    if (focused !== MainMenuButton.StartGame) {
      DOM.deselect(this.selectedTarget());
    }
    this.callAction(this.actionMap[focused]);
    return true;
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

  private gotoElem = (button: MainMenuButton) => {
    this.selected = button;
    DOM.select(this.selectedTarget());
    return true;
  }

  gotoFirst = () => {
    const nextElement = this.lookupElement(MAIN_MENU_BUTTON_ORDER[0]);
    if (nextElement) {
      if (this.selected) DOM.deselect(this.selectedTarget());
      this.selected = MAIN_MENU_BUTTON_ORDER[0];
      DOM.select(this.selectedTarget());
    }
    return true;
  };
  gotoPrev = () => {
    this.goto(-1);
    return true;
  };
  gotoNext = () => {
    this.goto(1);
    return true;
  };
  gotoUp = () => {
    const focused = this.getFocused()
    if (focused !== null) {
      switch (focused) {
        case MainMenuButton.Community:
        case MainMenuButton.Leaderboard:
        case MainMenuButton.OSTMode:
        case MainMenuButton.QuoteMode:
        case MainMenuButton.Settings:
          return this.gotoElem(MainMenuButton.QuitGame);
        case MainMenuButton.StartGame:
          return this.gotoElem(MainMenuButton.OSTMode);
      }
    }
    return this.gotoPrev()
  };
  gotoDown = () => {
    const focused = this.getFocused()
    if (focused !== null) {
      switch (focused) {
        case MainMenuButton.Community:
        case MainMenuButton.Leaderboard:
        case MainMenuButton.OSTMode:
        case MainMenuButton.QuoteMode:
        case MainMenuButton.Settings:
          return this.gotoElem(MainMenuButton.StartGame);
        case MainMenuButton.QuitGame:
          return this.gotoElem(MainMenuButton.OSTMode);
      }
    }
    return this.gotoNext()
  };
  gotoLeft = () => {
    const focused = this.getFocused()
    if (focused !== null) {
      switch (focused) {
        case MainMenuButton.OSTMode:
            return this.gotoElem(MainMenuButton.Settings);
        case MainMenuButton.StartGame:
          return false;
        case MainMenuButton.QuitGame:
          return false;
      }
    }
    return this.gotoPrev()
  };
  gotoRight = () => {
    const focused = this.getFocused()
    if (focused !== null) {
      switch (focused) {
        case MainMenuButton.Settings:
          return this.gotoElem(MainMenuButton.OSTMode);
        case MainMenuButton.StartGame:
          return false;
        case MainMenuButton.QuitGame:
          return false;
      }
    }
    return this.gotoNext()
  };
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
      return true
    } else if (focused === SettingsMenuElement.CheckboxCasualMode) {
      this.callAction(InputAction.ToggleCasualMode);
      return true
    } else if (focused === SettingsMenuElement.CheckboxCobraMode) {
      this.callAction(InputAction.ToggleCobraMode);
      return true
    } else if (focused === SettingsMenuElement.CheckboxDisableScreenshake) {
      this.callAction(InputAction.ToggleScreenshakeDisabled);
      return true
    }
    return true
  };

  getFocused = (): SettingsMenuElement | null => {
    if (!document.activeElement) return null;
    for (let i = 0; i < SETTINGS_MENU_ELEMENT_ORDER.length; i++) {
      const target = this.elementMap[SETTINGS_MENU_ELEMENT_ORDER[i]];
      if (target && target === document.activeElement) return SETTINGS_MENU_ELEMENT_ORDER[i];
    }
    return null;
  }

  private getElementPosition = (element: SettingsMenuElement | null): number => {
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
    return true;
  };
  gotoPrev = () => {
    this.goto(-1);
    return true;
  };
  gotoNext = () => {
    this.goto(1);
    return true;
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
  ButtonWarpX01 = 'pauseButtonWarpX01',
  ButtonWarpX02 = 'pauseButtonWarpX02',
  ButtonWarpX03 = 'pauseButtonWarpX03',
  ButtonWarpX04 = 'pauseButtonWarpX04',
  ButtonWarpX05 = 'pauseButtonWarpX05',
  ButtonWarpX06 = 'pauseButtonWarpX06',
  ButtonWarpX07 = 'pauseButtonWarpX07',
  ButtonWarpX08 = 'pauseButtonWarpX08',
  ButtonWarpX09 = 'pauseButtonWarpX09',
  ButtonWarpX10 = 'pauseButtonWarpX10',
  ButtonWarpX11 = 'pauseButtonWarpX11',
  ButtonWarpX12 = 'pauseButtonWarpX12',
  ButtonWarpX13 = 'pauseButtonWarpX13',
  ButtonWarpX14 = 'pauseButtonWarpX14',
  ButtonWarpX15 = 'pauseButtonWarpX15',
  ButtonWarpX16 = 'pauseButtonWarpX16',
  ButtonWarpX17 = 'pauseButtonWarpX17',
}

const PAUSE_MENU_ELEMENT_ORDER: [
  [PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
  [PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement, PauseMenuElement],
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
    [
      PauseMenuElement.ButtonWarpX17,
      PauseMenuElement.ButtonWarpX01,
      PauseMenuElement.ButtonWarpX02,
      PauseMenuElement.ButtonWarpX03,
      PauseMenuElement.ButtonWarpX04,
      PauseMenuElement.ButtonWarpX05,
    ],
    [
      PauseMenuElement.ButtonWarpX06,
      PauseMenuElement.ButtonWarpX07,
      PauseMenuElement.ButtonWarpX08,
      PauseMenuElement.ButtonWarpX09,
      PauseMenuElement.ButtonWarpX10,
      PauseMenuElement.ButtonWarpX11,
    ],
    [
      PauseMenuElement.ButtonWarpX12,
      PauseMenuElement.ButtonWarpX13,
      PauseMenuElement.ButtonWarpX14,
      PauseMenuElement.ButtonWarpX15,
      PauseMenuElement.ButtonWarpX16,
    ],
  ]

export class PauseMenuNavMap extends GroupedNavMap<PauseMenuElement> {
  constructor(callAction: (element: PauseMenuElement) => void) {
    super(callAction, PAUSE_MENU_ELEMENT_ORDER)
  }
}

export enum GameOverMenuElement {
  ButtonTryAgain = 'gameOverButtonTryAgain',
  ButtonMainMenu = 'gameOverButtonMainMenu',
}

const GAME_OVER_ELEMENT_ORDER = [
  [
    GameOverMenuElement.ButtonTryAgain,
    GameOverMenuElement.ButtonMainMenu,
  ],
];

export class GameOverMenuNavMap extends GroupedNavMap<GameOverMenuElement> {
  constructor(callAction: (element: GameOverMenuElement) => void) {
    super(callAction, GAME_OVER_ELEMENT_ORDER)
  }
}



const GAME_MODE_MENU_ELEMENT_ORDER = [
  [
    GameModeMenuElement.Campaign,
    GameModeMenuElement.LevelSelect,
    GameModeMenuElement.Randomizer,
    GameModeMenuElement.Back,
  ],
];

export class GameModeMenuNavMap extends GroupedNavMap<GameModeMenuElement> {
  constructor(callAction: (element: GameModeMenuElement) => void) {
    super(callAction, GAME_MODE_MENU_ELEMENT_ORDER)
  }
}

export class LevelSelectMenuNavMap extends GroupedNavMap<string> {
  constructor(callAction: (id: string) => void, order: string[]) {
    super(callAction, [order], { preventScroll: true })
  }
}
