import { GameSettings } from "../types";
import { BaseStore } from "./BaseStore";

export class SettingsStore extends BaseStore<GameSettings> implements GameSettings {
  public get key(): string { return "settings"; }

  private readonly defaultValue: GameSettings = {
    musicVolume: 1,
    sfxVolume: 1,
    isScreenShakeDisabled: false,
  };

  private state: GameSettings = {
    ...this.defaultValue,
    ...this.getStore(),
  };

  private set = (incoming: Partial<GameSettings>) => {
    this.state = { ...this.getStore(), ...incoming };
    this.setStore(this.state);
  };

  public get musicVolume() { return this.state.musicVolume; }
  public set musicVolume(val: number) { this.set({ musicVolume: val }); }

  public get sfxVolume() { return this.state.sfxVolume; }
  public set sfxVolume(val: number) { this.set({ sfxVolume: val }); }

  public get isScreenShakeDisabled() { return this.state.isScreenShakeDisabled; }
  public set isScreenShakeDisabled(val: boolean) { this.set({ isScreenShakeDisabled: val }); }
}
