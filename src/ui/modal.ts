import { UICancelHandler, UIHandler, UIInteractHandler, UINavEventHandler } from "../types";
import { UI } from "./ui";
import { requireElementById } from "./uiUtils";

export class Modal implements UIHandler {
  private modal: HTMLElement;
  private title: HTMLElement;
  private message: HTMLElement;
  private buttonNo: HTMLElement;
  private buttonYes: HTMLElement;
  private handleNoClick: () => void = null;
  private handleYesClick: () => void = null;
  private isShowing: boolean = false;
  private hideOnCancel: boolean = true;
  private isInputReady: boolean = false;

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

  setHideOnCancel = (val: boolean) => {
    this.hideOnCancel = val;
    return this;
  }

  show = (title: string, message: string, handleYesClick: () => void, handleNoClick: () => void) => {
    if (this.isShowing) return;
    UI.enableGameBlur();
    this.addBindings();
    this.isShowing = true;
    this.handleNoClick = handleNoClick;
    this.handleYesClick = handleYesClick;
    this.title.innerText = title;
    this.message.innerText = message;
    this.modal.classList.remove("hidden");
    setTimeout(() => {
      this.buttonNo.focus();
    }, 0);
    // set a small delay to start receiving input in order to fix strange firefox bug where modal is immediately dismissing on show().
    setTimeout(() => {
      this.isInputReady = true;
    }, 100)
  }

  hide = () => {
    UI.disableGameBlur();
    this.modal.classList.add("hidden");
    this.removeBindings();
    this.isShowing = false;
    this.isInputReady = false;
    this.handleNoClick = null;
    this.handleYesClick = null;
  }

  handleUINavigation: UINavEventHandler = () => {
    if (!this.isShowing) return false;
    if (!this.isInputReady) return false;
    this.gotoNextOption();
    return true;
  }

  handleUIInteract: UIInteractHandler = () => {
    if (!this.isShowing) return false;
    if (!this.isInputReady) return false;
    this.onSubmit();
    return true;
  }

  handleUICancel: UICancelHandler = () => {
    if (!this.isShowing) return false;
    if (!this.isInputReady) return false;
    this.handleNoClick?.();
    if (this.hideOnCancel) {
      this.hide();
    }
    return true;
  }

  private onNoClick = () => {
    if (!this.isShowing) return;
    if (!this.isInputReady) return false;
    this.handleNoClick?.();
  }

  private onYesClick = () => {
    if (!this.isShowing) return;
    if (!this.isInputReady) return false;
    this.handleYesClick?.();
  }

  private onSubmit = () => {
    if (!this.isShowing) return;
    if (!this.isInputReady) return false;
    if (document.activeElement === this.buttonYes) {
      this.onYesClick();
    } else {
      this.onNoClick();
    }
  }

  private gotoNextOption = () => {
    if (!this.isShowing) return;
    if (!this.isInputReady) return false;
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