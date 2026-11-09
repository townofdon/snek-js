import { IS_DEV, MAX_LIVES } from "@/constants";
import {
  Achievement,
  DifficultyIndex,
  Episode,
  GameMode,
  LevelCompletion,
  LevelId,
  Outfit,
  SaveData,
  SaveSlot,
  SaveSlotData,
  WearableFrame,
} from "../types";
import { DEFAULT_OUTFIT, DEFAULT_SAVE_SLOT_DATA } from "@/defaults";
import { BaseStore } from "./BaseStore";

class SaveDataStoreImpl extends BaseStore<SaveData> {
  public get key(): string { return "save-data" }

  private readonly defaultValue: SaveData = {
    isCobraModeUnlocked: false,
    completion: {},
    achievements: {},
    slot1: null,
    slot2: null,
    slot3: null,
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

  public getSlot = (slot: SaveSlot): SaveSlotData => {
    switch (slot) {
      case SaveSlot.Slot1:
        return this.state.slot1;
      case SaveSlot.Slot2:
        return this.state.slot2;
      case SaveSlot.Slot3:
        return this.state.slot3;
      case SaveSlot.Unset:
      default:
        return null;
    }
  };

  private setSlot = (slot: SaveSlot, data: SaveSlotData) => {
    switch (slot) {
      case SaveSlot.Slot1:
        this.set({ slot1: data });
        break;
      case SaveSlot.Slot2:
        this.set({ slot2: data });
        break;
      case SaveSlot.Slot3:
        this.set({ slot3: data });
        break;
      case SaveSlot.Unset:
      default:
        throw new Error(`[SaveDataStore] Invalid save slot: ${slot}`);
    }
  }

  public getIsSlotUsed = (slot: SaveSlot): boolean => {
    return !!this.getSlot(slot)?.lastLevelId;
  };

  public setCurrentSaveSlot = (slot: SaveSlot) => {
    this.currentSlot = slot;
  }

  public clearCurrentSaveSlot = () => {
    this.currentSlot = SaveSlot.Unset;
  }

  public newGame = (gameMode: GameMode, levelId: string, episode: Episode) => {
    const slot = this.currentSlot;
    if (!slot) {
      console.warn(`[SaveDataStore] Save slot is unset: ${slot}`)
      return;
    }
    const newSlotData = {
      ...DEFAULT_SAVE_SLOT_DATA,
      lastLevelId: levelId,
      lives: MAX_LIVES,
      episode,
      gameMode,
    } satisfies SaveSlotData;
    this.currentSlot = slot;
    this.setSlot(slot, newSlotData);
  }

  public resetSaveSlot = (slot: SaveSlot) => {
    this.setSlot(slot, null);
  }

  public resetCurrentSaveSlot = () => {
    const slot = this.currentSlot;
    if (slot) {
      this.setSlot(slot, null);
    }
  }

  public save = (incoming: Omit<SaveSlotData, 'wearablesUnlocked' | 'outfit'>) => {
    const slot = this.currentSlot;
    if (!slot) {
      throw new Error(`[SaveDataStore] Save slot is unset: ${slot}`);
    }
    const saveSlotData = this.getSlot(slot);
    const data = {
      ...DEFAULT_SAVE_SLOT_DATA,
      ...saveSlotData,
      lives: incoming.lives,
      lastLevelId: incoming.lastLevelId,
      episode: incoming.episode,
      gameMode: incoming.gameMode,
      difficulty: incoming.difficulty,
      stats: { ...incoming.stats },
      heldItems: { ...incoming.heldItems },
    } satisfies SaveSlotData;
    this.setSlot(slot, data);
  }

  public updateLives = (incoming: number) => {
    const slot = this.currentSlot;
    if (!slot) {
      throw new Error(`[SaveDataStore] Save slot is unset: ${slot}`);
    }
    const saveSlotData = this.getSlot(slot);
    const data = {
      ...saveSlotData,
      lives: incoming,
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

  public getUnlockedWearables = (): Partial<Record<WearableFrame, boolean>> => {
    const slot = this.currentSlot;
    if (!slot) {
      throw new Error(`[SaveDataStore] Save slot is unset: ${slot}`);
    }
    const data = this.getSlot(slot);
    if (!data) {
      return {};
    }
    return data.wearablesUnlocked;
  }

  public getUnlockedWearablesList = (): WearableFrame[] => {
    const slot = this.currentSlot;
    if (!slot) {
      return [];
    }
    const data = this.getSlot(slot);
    if (!data) {
      return [];
    }
    return unlockedWearablesToList(data.wearablesUnlocked);
  }

  public setOutfit = (incoming: Partial<Outfit>) => {
    const slot = this.currentSlot;
    if (!slot) {
      throw new Error(`[SaveDataStore] Save slot is unset: ${slot}`);
    }
    const data = this.getSlot(slot);
    data.outfit = { ...DEFAULT_OUTFIT, ...data.outfit, ...incoming };
    this.setSlot(slot, data);
  }

  public getIsCobraModeUnlocked = (): boolean => {
    return this.state.isCobraModeUnlocked;
  }

  public getLevelCompleted = (levelId: LevelId | undefined) => {
    return !!(false
      || this.state.completion[levelId]?.[1]?.completed
      || this.state.completion[levelId]?.[2]?.completed
      || this.state.completion[levelId]?.[3]?.completed
      || this.state.completion[levelId]?.[4]?.completed
    );
  }

  public getLevelCompletedByDifficulty = (levelId: LevelId | undefined, difficultyIndex: DifficultyIndex) => {
    return !!this.state.completion[levelId]?.[difficultyIndex]?.completed
  }

  public getLevelPerfect = (levelId: LevelId | undefined, difficultyIndex: DifficultyIndex) => {
    return !!this.state.completion[levelId]?.[difficultyIndex]?.perfect
  }

  public unlockCobraMode = () => {
    this.state.isCobraModeUnlocked = true;
    this.setStore(this.state);
  }

  public getAchievements = () => ({ ...this.state.achievements, });

  public setAchievement = (achievement: Achievement) => {
    if (!achievement) return;
    const achievements = this.state.achievements || {};
    achievements[achievement] = true;
    this.set({ achievements });
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


//#region DEV STORE
class DevSaveDataStore extends SaveDataStoreImpl {
  private store: SaveData = {
    isCobraModeUnlocked: true,
    completion: {},
    achievements: {},
    slot1: {
      ...DEFAULT_SAVE_SLOT_DATA,
      wearablesUnlocked: {
        ...DEFAULT_SAVE_SLOT_DATA.wearablesUnlocked,
        [WearableFrame.Glasses]: true,
        [WearableFrame.LuchadoreMaskRed]: true,
        [WearableFrame.Mustache]: true,
        [WearableFrame.TechVisor]: true,
        [WearableFrame.Sunglasses]: true,
        [WearableFrame.IndianaJonesHat]: true,
        [WearableFrame.Monocle]: true,
        [WearableFrame.RoyalCape]: true,
      },
    },
    slot2: undefined,
    slot3: undefined,
  };

  public get key(): string {
    return 'dev'
  }
  public getSlot: (slot: SaveSlot) => SaveSlotData = (slot) => this.store.slot1;
  public getIsSlotUsed: (slot: SaveSlot) => boolean = (slot) => true;
  public setCurrentSaveSlot: (slot: SaveSlot) => void = () => {};
  public clearCurrentSaveSlot: () => void = () => {};
  public newGame: (gameMode: GameMode, levelId: string, episode: Episode) => void = (gameMode, levelId, episode) => {
    this.store.slot1 = { ...DEFAULT_SAVE_SLOT_DATA, gameMode, episode, lastLevelId: levelId };
  };
  public resetSaveSlot: (slot: SaveSlot) => void = () => {
    this.store.slot1 = { ...DEFAULT_SAVE_SLOT_DATA };
  };
  public resetCurrentSaveSlot: () => void = () => {
    this.store.slot1 = { ...DEFAULT_SAVE_SLOT_DATA };
  };
  public save: (incoming: Omit<SaveSlotData, "wearablesUnlocked" | "outfit">) => void = (incoming) => {
    this.store.slot1 = { ...DEFAULT_SAVE_SLOT_DATA, ...this.store.slot1, ...incoming };
  };
  public updateLives: (incoming: number) => void = (incoming) => {
    this.store.slot1 = { ...DEFAULT_SAVE_SLOT_DATA, ...this.store.slot1, lives: incoming };
  };
  public unlockWearable: (item: WearableFrame) => void = (item) => {
    const unlocked = this.store.slot1.wearablesUnlocked;
    unlocked[item] = true;
    this.store.slot1 = { ...DEFAULT_SAVE_SLOT_DATA, ...this.store.slot1, wearablesUnlocked: unlocked };
  };
  public getUnlockedWearables: () => Partial<Record<WearableFrame, boolean>> = () => this.store.slot1.wearablesUnlocked;
  public getUnlockedWearablesList: () => WearableFrame[] = () => unlockedWearablesToList(this.store.slot1.wearablesUnlocked);
  public setOutfit: (incoming: Partial<Outfit>) => void = (incoming) => {
    const outfit = { ...this.store.slot1.outfit, ...incoming };
    this.store.slot1 = { ...DEFAULT_SAVE_SLOT_DATA, ...this.store.slot1, outfit };
  };
  public getIsCobraModeUnlocked: () => boolean = () => true;
  public getLevelCompleted: (levelId: LevelId | undefined) => boolean = () => true;
  public getLevelCompletedByDifficulty: (levelId: LevelId | undefined, difficultyIndex: DifficultyIndex) => boolean = () => true;
  public getLevelPerfect: (levelId: LevelId | undefined, difficultyIndex: DifficultyIndex) => boolean = () => false;
  public unlockCobraMode: () => void = () => {};
  public getAchievements: () => Partial<Record<Achievement, boolean>> = () => ({});
  public setAchievement: (achievement: Achievement) => void = () => {};
  public recordLevelCompletion: (levelId: LevelId | undefined, difficultyIndex: DifficultyIndex, perfect: boolean, time: number) => void = () => {};
  public reset: () => void = () => { this.resetCurrentSaveSlot(); };
}



//#region UTILS
function unlockedWearablesToList(wearablesUnlocked: Record<WearableFrame, boolean>) {
  return Object.keys(wearablesUnlocked || {})
      .map(key => parseInt(key, 10))
      .filter((key: WearableFrame) => key && !Number.isNaN(key) && wearablesUnlocked[key])
      .map((key: WearableFrame) => key || WearableFrame.None);
}


export type SaveDataStore = SaveDataStoreImpl;
export const saveDataStore: SaveDataStore = (IS_DEV && window.location.href.includes('/dev')) ? new DevSaveDataStore() : new SaveDataStoreImpl();
