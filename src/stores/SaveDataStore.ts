import { DifficultyIndex, LevelCompletion, LevelId, SaveData } from "../types";
import { BaseStore } from "./BaseStore";

export class SaveDataStore extends BaseStore<SaveData> {
  public get key(): string { return "save-data" }

  private readonly defaultValue: SaveData = {
    isCobraModeUnlocked: false,
    completion: {},
  };

  private state: SaveData = {
    ...this.defaultValue,
    ...this.getStore(),
  };

  public getIsCobraModeUnlocked = (): boolean => {
    return this.state.isCobraModeUnlocked;
  }

  public getLevelCompleted = (levelId: LevelId | undefined, difficultyIndex: DifficultyIndex) => {
    return !!this.state.completion[levelId]?.[difficultyIndex]?.completed
  }

  public getLevelPerfect = (levelId: LevelId | undefined, difficultyIndex: DifficultyIndex) => {
    return !!this.state.completion[levelId]?.[difficultyIndex]?.perfect
  }

  public unlockCobraMode = () => {
    this.state.isCobraModeUnlocked = true;
    this.setStore(this.state);
  }

  public recordLevelCompletion = (levelId: LevelId | undefined, difficultyIndex: DifficultyIndex, perfect: boolean, time: number) => {
    if (!levelId) return;
    if (!this.state.completion[levelId]) {
      this.state.completion[levelId] = newCompletionByDifficulty();
    }
    if (!this.state.completion[levelId][difficultyIndex]) {
      this.state.completion[levelId][difficultyIndex] = newLevelCompletion();
    }
    this.state.completion[levelId][difficultyIndex].completed = true;
    if (!this.state.completion[levelId][difficultyIndex].perfect) {
      this.state.completion[levelId][difficultyIndex].perfect = perfect;
    }
    if (!this.state.completion[levelId][difficultyIndex].bestTime || time < this.state.completion[levelId][difficultyIndex].bestTime) {
      this.state.completion[levelId][difficultyIndex].bestTime = time;
    }
    this.setStore(this.state);
  }

  public reset = () => {
    this.clearStore();
    this.state = { ...this.defaultValue };
  }
}

function newCompletionByDifficulty() {
  return {
    1: newLevelCompletion(),
    2: newLevelCompletion(),
    3: newLevelCompletion(),
    4: newLevelCompletion(),
  } satisfies Record<DifficultyIndex, LevelCompletion>;
}

function newLevelCompletion() {
  return {
    completed: false,
    perfect: false,
    bestTime: 0,
  } satisfies LevelCompletion;
}
