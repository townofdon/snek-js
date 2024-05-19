import { findLevelWarpIndex } from "../levels/levelUtils";
import { Difficulty, Level, SaveData } from "../types";
import { BaseStore } from "./BaseStore";

export class SaveDataStore extends BaseStore<SaveData> {
  public get key(): string {
    return "save-data"
  }

  private readonly defaultValue: SaveData = {
    isCobraModeUnlocked: false,
    levelProgress: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    },
  };

  private state: SaveData = this.getStore() || { ...this.defaultValue };

  public get = (): SaveData => {
    return this.state;
  }

  public unlockCobraMode = () => {
    this.state.isCobraModeUnlocked = true;
    this.setStore(this.state);
  }

  public recordLevelProgress = (level: Level, difficulty: Difficulty) => {
    const levelNum = findLevelWarpIndex(level);
    if (levelNum > this.state.levelProgress[difficulty.index]) {
      this.state.levelProgress[difficulty.index] = levelNum;
      this.setStore(this.state);
    }
  }

  public reset = () => {
    this.clearStore();
    this.state = { ...this.defaultValue };
  }
}
