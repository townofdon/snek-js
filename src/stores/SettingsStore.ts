import { GameSettings, ResolutionMode } from "../types";
import { BaseStore } from "./BaseStore";

class SettingsStore extends BaseStore<GameSettings> implements GameSettings {
  public get key(): string { return "settings"; }

  private readonly defaultValue: GameSettings = {
    musicVolume: 1,
    sfxVolume: 1,
    isScreenShakeDisabled: false,
    resolutionMode: ResolutionMode.PixelPerfect,
    fullScreen: true,
  };

  private state: GameSettings = {
    ...this.defaultValue,
    ...this.getStore(),
  };

  private set = (incoming: Partial<GameSettings>) => {
    this.state = { ...this.getStore(), ...incoming };
    this.setStore(this.state);
  };

  public get musicVolume() { return this.state.musicVolume ?? this.defaultValue.musicVolume; }
  public set musicVolume(val: number) { this.set({ musicVolume: val }); }

  public get sfxVolume() { return this.state.sfxVolume ?? this.defaultValue.sfxVolume; }
  public set sfxVolume(val: number) { this.set({ sfxVolume: val }); }

  public get isScreenShakeDisabled() { return this.state.isScreenShakeDisabled; }
  public set isScreenShakeDisabled(val: boolean) { this.set({ isScreenShakeDisabled: val }); }

  public get resolutionMode() { return this.state.resolutionMode; }
  public set resolutionMode(val: ResolutionMode) { this.set({ resolutionMode: val }); }

  public get fullScreen() { return this.state.fullScreen; }
  public set fullScreen(val: boolean) {
    this.set({ fullScreen: val });
    triggerFullscreenChange(val);
  }
}

export const triggerFullscreenChange = (incoming: boolean) => {
  const win = (typeof nw !== 'undefined' && nw && nw.Window && nw.Window.get()) || undefined;
  if (incoming) {
    if (win) {
      // native app
      if (!win.isFullscreen) win.enterFullscreen();
    } else {
      // web
      if (!document.fullscreenElement) document.body.requestFullscreen();
    }
  } else {
    if (win) {
      // native app
      if (win.isFullscreen) win.leaveFullscreen();
    } else {
      // web
      if (document.fullscreenElement) document.exitFullscreen();
    }
  }
}

export const settings = new SettingsStore();
