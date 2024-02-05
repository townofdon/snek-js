
export interface NavMapElement {
  target: HTMLElement,
  callback?: () => void,
}

export interface NavMap {
  selected: NavMapElement | null,
  callSelected: () => void,
  gotoPrev: () => void,
  gotoNext: () => void,
  gotoUp: () => void,
  gotoDown: () => void,
  gotoLeft: () => void,
  gotoRight: () => void,
}

export enum MainMenuButton {
  Start = 0,
  Settings = 1,
  Leaderboard = 2,
  QuoteMode = 3,
  OSTMode = 4,
}
export interface NavMapElementMainMenu extends NavMapElement {
  button: MainMenuButton,
}
export interface UINavMapMainMenuConstructorArgs {
  elements: NavMapElementMainMenu[]
}
export class UINavMapMainMenu implements NavMap {
  private elements: NavMapElementMainMenu[] = []
  private order: MainMenuButton[] = [
    MainMenuButton.Start,
    MainMenuButton.Settings,
    MainMenuButton.Leaderboard,
    MainMenuButton.QuoteMode,
    MainMenuButton.OSTMode,
  ]
  selected: NavMapElementMainMenu = null;

  constructor(args: UINavMapMainMenuConstructorArgs) {
    this.elements = args.elements;
  }

  callSelected = () => {
    if (this.selected?.callback) this.selected.callback();
  };

  private getButtonPosition = (button: MainMenuButton): number => {
    for (let i = 0; i < this.order.length; i++) {
      if (this.order[i] === button) return i;
    }
    return -1;
  }

  private findElement = (button: MainMenuButton): NavMapElementMainMenu | null => {
    for (let i = 0; i < this.elements.length; i++) {
      if (this.elements[i].button === button) return this.elements[i];
    }
    return null;
  }

  private goto = (diff: number) => {
    const currentButtonPosition = Math.max(this.selected ? this.getButtonPosition(this.selected.button) : 0, 0);
    const nextIndex = (this.order.length + currentButtonPosition + diff) % this.order.length;
    const nextElement = this.findElement(this.order[nextIndex]);
    if (nextElement) {
      this.selected = nextElement;
      this.selected.target.focus();
    }
  }

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
