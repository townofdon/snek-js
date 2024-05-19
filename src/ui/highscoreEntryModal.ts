import { faker } from '@faker-js/faker';

import { UICancelHandler, UIHandler, UIInteractHandler, UINavEventHandler } from "../types";
import { UI } from "./ui";
import { requireElementById } from "./uiUtils";

export class HighscoreEntryModal implements UIHandler {
  private modal: HTMLElement;
  private form: HTMLFormElement;
  private inputName: HTMLInputElement;
  private onSubmitName: (name: string) => void = () => { }
  private isShowing: boolean = false;
  private isSubmitting: boolean = false;

  constructor() {
    this.modal = requireElementById<HTMLElement>('modal-highscore-entry');
    this.form = requireElementById<HTMLFormElement>('form-highscore-entry');
    this.inputName = requireElementById<HTMLInputElement>('input-highscore-name');
  }
  handleUINavigation: UINavEventHandler = () => {
    return false;
  };
  handleUIInteract: UIInteractHandler = () => {
    if (!this.isShowing) return false;
    this.onSubmit();
    return true;
  };
  handleUICancel: UICancelHandler = () => {
    return false;
  };

  getIsShowing = (): boolean => {
    return this.isShowing;
  }

  show = (onSubmitName: (name: string) => void, initialName?: string) => {
    if (this.isShowing) return;
    this.isShowing = true;
    UI.enableGameBlur();
    this.onSubmitName = onSubmitName;
    this.modal.classList.remove("hidden");
    this.inputName.value = initialName ? initialName : "Snek" + faker.person.firstName();
    this.inputName.focus();
    this.inputName.select();
  }

  hide = () => {
    UI.disableGameBlur();
    this.modal.classList.add("hidden");
    this.isShowing = false;
  }

  private onSubmit = () => {
    if (!this.isShowing) return;
    if (this.isSubmitting) return;
    try {
      this.isSubmitting = true;
      const formData = new FormData(this.form);
      this.onSubmitName(formData.get('input-highscore-name') as string)
    } catch (err) {
      console.log(err);
    } finally {
      this.isSubmitting = false;
    }
  }
}
