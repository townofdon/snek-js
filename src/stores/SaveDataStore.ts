import { DIFFICULTY_EASY } from "@/constants";
import { DEFAULT_HELD_ITEMS, DEFAULT_BASE_STATS, DEFAULT_WEARABLES_UNLOCKED } from "@/defaults";
import { DifficultyIndex, GameMode, LevelCompletion, LevelId, SaveData, SaveSlot, SaveSlotData, WearableFrame } from "../types";
import { BaseStore } from "./BaseStore";

class SaveDataStoreImpl extends BaseStore<SaveData> {
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

  private currentSlot: SaveSlot = SaveSlot.Unset;

  private set = (incoming: Partial<SaveData>) => {
    this.state = { ...this.getStore(), ...incoming };
    this.setStore(this.state);
  };

  private getSlot = (slot: SaveSlot): SaveSlotData => {
    switch (slot) {
      case SaveSlot.Slot0:
        return this.state.slot0;
      case SaveSlot.Slot1:
        return this.state.slot1;
      case SaveSlot.Slot2:
        return this.state.slot2;
      case SaveSlot.Unset:
      default:
        return null;
    }
  };

  private setSlot = (slot: SaveSlot, data: SaveSlotData) => {
    switch (slot) {
      case SaveSlot.Slot0:
        this.set({ slot0: data });
        break;
      case SaveSlot.Slot1:
        this.set({ slot1: data });
        break;
      case SaveSlot.Slot2:
        this.set({ slot2: data });
        break;
      case SaveSlot.Unset:
      default:
        throw new Error(`[SaveDataStore] Invalid save slot: ${slot}`);
    }
  }

  public getIsSlotUsed = (slot: SaveSlot): boolean => {
    return !!this.getSlot(slot)?.currentLevel;
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
    this.currentSlot = slot;
    this.setSlot(slot, newSlotData);
  }

  public resetSaveSlot = (slot: SaveSlot) => {
    this.setSlot(slot, null);
  }

  public resetCurrentSaveSlot = () => {
    const slot = this.currentSlot;
    if (!slot) {
      throw new Error(`[SaveDataStore] Save slot is unset: ${slot}`);
    }
    this.setSlot(slot, null);
  }

  public save = async (incoming: Omit<SaveSlotData, 'wearablesUnlocked'>) => {
    // TODO: enable save slots
    return;
    const slot = this.currentSlot;
    if (!slot) {
      throw new Error(`[SaveDataStore] Save slot is unset: ${slot}`);
    }
    const data = {
      currentLevel: incoming.currentLevel,
      gameMode: incoming.gameMode,
      difficulty: incoming.difficulty,
      wearablesUnlocked: this.getSlot(slot).wearablesUnlocked,
      stats: { ...incoming.stats },
      heldItems: { ...incoming.heldItems },
    } satisfies SaveSlotData;
    this.setSlot(slot, data);
  }

  public unlockWearable = (item: WearableFrame) => {
    const slot = this.currentSlot;
    if (!slot) {
      throw new Error(`[SaveDataStore] Save slot is unset: ${slot}`);
    }
    const data = { ...this.getSlot(slot) } satisfies SaveSlotData;
    if (!data) {
      throw new Error(`[SaveDataStore] Slot data was nil: slot=${slot},data=${String(data)}`);
    }
    data.wearablesUnlocked = { ...data.wearablesUnlocked, [item]: true };
    this.setSlot(slot, data);
  }

  public getUnlockedWearables = (): WearableFrame[] => {
    const slot = this.currentSlot;
    if (!slot) {
      throw new Error(`[SaveDataStore] Save slot is unset: ${slot}`);
    }
    const data = this.getSlot(slot);
    if (!data) {
      return [];
    }
    return Object.keys(data.wearablesUnlocked)
      .filter((key: string) => data.wearablesUnlocked[WearableFrame[key]])
      .map(key => WearableFrame[key] || WearableFrame.None);
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

export type SaveDataStore = SaveDataStoreImpl;
export const saveDataStore = new SaveDataStoreImpl();
