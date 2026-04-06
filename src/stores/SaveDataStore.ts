import { DIFFICULTY_EASY } from "@/constants";
import { DEFAULT_HELD_ITEMS, DEFAULT_BASE_STATS, DEFAULT_WEARABLES_UNLOCKED } from "@/defaults";
import { DifficultyIndex, GameMode, LevelCompletion, LevelId, SaveData, SaveSlot, SaveSlotData } from "../types";
import { BaseStore } from "./BaseStore";

export class SaveDataStore extends BaseStore<SaveData> {
  public get key(): string { return "save-data" }

  private readonly defaultValue: SaveData = {
    isCobraModeUnlocked: false,
    completion: {},
    slot0: null,
    slot1: null,
    slot2: null,
  } satisfies SaveData;

  private state: SaveData = {
    ...this.defaultValue,
    ...this.getStore(),
  };

  private set = (incoming: Partial<SaveData>) => {
    this.state = { ...this.getStore(), ...incoming };
    this.setStore(this.state);
  };

  public getIsSlotUsed = (slot: SaveSlot): boolean => {
    switch (slot) {
      case 0:
        return !!this.state.slot0?.currentLevel
      case 1:
        return !!this.state.slot1?.currentLevel
      case 2:
        return !!this.state.slot2?.currentLevel
      default:
        return false;
    }
  };

  public newSaveSlot = (slot: SaveSlot, gameMode: GameMode) => {
    const newSlotData = {
      currentLevel: 0,
      gameMode,
      difficulty: DIFFICULTY_EASY.index,
      wearablesUnlocked: { ...DEFAULT_WEARABLES_UNLOCKED },
      stats: { ...DEFAULT_BASE_STATS },
      heldItems: { ...DEFAULT_HELD_ITEMS },
    } satisfies SaveSlotData;
    switch (slot) {
      case 0:
        this.set({ slot0: newSlotData });
        break;
      case 1:
        this.set({ slot1: newSlotData });
        break;
      case 2:
        this.set({ slot2: newSlotData });
        break;
      default:
        break;
    }
  }

  public resetSaveSlot = (slot: SaveSlot) => {
    switch (slot) {
      case 0:
        this.set({ slot0: null });
        break;
      case 1:
        this.set({ slot1: null });
        break;
      case 2:
        this.set({ slot2: null });
        break;
      default:
        break;
    }
  }

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
