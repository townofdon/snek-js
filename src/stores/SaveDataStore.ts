import { Difficulty, SaveData } from "../types";
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

  private state: SaveData = {
    ...this.defaultValue,
    ...this.getStore(),
  };

  public getIsCobraModeUnlocked = (): boolean => {
    return this.state.isCobraModeUnlocked;
  }

  public getLevelProgress = (difficulty: Difficulty): number => {
    let difficultyIndex = difficulty.index;
    let levelProgress = 0;
    do {
      levelProgress = Math.max(levelProgress, this.state.levelProgress[difficultyIndex] || 0)
      difficultyIndex++;
    } while (difficultyIndex < 5);
    return levelProgress;
  }

  public unlockCobraMode = () => {
    this.state.isCobraModeUnlocked = true;
    this.setStore(this.state);
  }

  public recordLevelProgress = (levelIndex: number, difficulty: Difficulty) => {
    if (levelIndex > this.state.levelProgress[difficulty.index]) {
      this.state.levelProgress[difficulty.index] = levelIndex;
      this.setStore(this.state);
    }
  }

  public reset = () => {
    this.clearStore();
    this.state = { ...this.defaultValue };
  }
}
