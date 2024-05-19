import { UICancelHandler, UIHandler, UIInteractHandler, UINavEventHandler } from "../types";
import { UI } from "./ui";
import { requireElementById } from "./uiUtils";

export class Modal implements UIHandler {
  private modal: HTMLElement;
  private title: HTMLElement;
  private message: HTMLElement;
  private buttonNo: HTMLElement;
  private buttonYes: HTMLElement;
  private handleNoClick: () => void = () => { };
  private handleYesClick: () => void = () => { };
  private isShowing: boolean = false;

  constructor() {
    this.modal = requireElementById<HTMLElement>('modal');
    this.title = requireElementById<HTMLElement>('modal-title');
    this.message = requireElementById<HTMLElement>('modal-message');
    this.buttonNo = requireElementById<HTMLElement>("modal-button-no");
    this.buttonYes = requireElementById<HTMLElement>("modal-button-yes");
  }

  cleanup = () => {
    this.hide();
  }

  getIsShowing = (): boolean => {
    return this.isShowing;
  }

  show = (title: string, message: string, handleYesClick: () => void, handleNoClick: () => void) => {
    if (this.isShowing) return;
    this.isShowing = true;
    UI.enableGameBlur();
    this.handleNoClick = handleNoClick;
    this.handleYesClick = handleYesClick;
    this.title.innerText = title;
    this.message.innerText = message;
    this.modal.classList.remove("hidden");
    this.addBindings();
    setTimeout(() => {
      this.buttonNo.focus();
    }, 0)
  }

  hide = () => {
    UI.disableGameBlur();
    this.modal.classList.add("hidden");
    this.removeBindings();
    this.isShowing = false;
  }

  handleUINavigation: UINavEventHandler = () => {
    if (!this.isShowing) return false;
    this.gotoNextOption();
    return true;
  }

  handleUIInteract: UIInteractHandler = () => {
    if (!this.isShowing) return false;
    this.onSubmit();
    return true;
  }

  handleUICancel: UICancelHandler = () => {
    if (!this.isShowing) return false;
    this.hide();
    return true;
  }

  private onNoClick = () => {
    this.handleNoClick();
  }

  private onYesClick = () => {
    this.handleYesClick();
  }

  private onSubmit = () => {
    if (!this.isShowing) return;
    if (document.activeElement === this.buttonNo) {
      this.onNoClick();
    } else {
      this.onYesClick();
    }
  }

  private gotoNextOption = () => {
    if (!this.isShowing) return;
    if (document.activeElement === this.buttonNo) {
      this.buttonYes.focus();
    } else {
      this.buttonNo.focus();
    }
  }

  private addBindings = () => {
    this.buttonNo.addEventListener("click", this.onNoClick);
    this.buttonYes.addEventListener("click", this.onYesClick);
  }

  private removeBindings = () => {
    this.buttonNo.removeEventListener("click", this.onNoClick);
    this.buttonYes.removeEventListener("click", this.onYesClick);
  }
}