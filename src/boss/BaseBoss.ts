import P5 from "p5";
import {
  Action,
  DifficultyIndex,
  EngineState,
  GameState,
  MapAnnotation,
  PlayerState,
  Scene,
  Boss,
  BossAgro,
  BossStartArgs,
  IEnumerator,
  ICollection,
  LoopState,
  ISFX,
  IVectorList,
  SmokeType,
  ThreatType,
  IMusicPlayer,
} from "@/types";
import { Renderer } from "@/engine/renderer";
import { SpriteRenderer } from "@/engine/spriteRenderer";
import { Coroutines } from "@/engine/coroutines";
import { AnimationList } from "@/collections/animationList";

export interface BossConstructorArgs {
  p5: P5;
  gameState: GameState;
  loopState: LoopState;
  es: EngineState;
  threats: AnimationList;
  apples: ICollection;
  player: PlayerState;
  segments: ICollection & IVectorList;
  annotations: Record<number, MapAnnotation>;
  renderer: Renderer;
  spriteRenderer: SpriteRenderer;
  difficulty: DifficultyIndex;
  sfx: ISFX;
  musicPlayer: IMusicPlayer;
  startAction: (enumerator: IEnumerator, actionKey: Action) => void,
  openDoors: () => void;
  spawnRegularApple: () => number;
  spawnPuffAt: (x: number, y: number) => void;
  spawnSmokeAt: (x: number, y: number, type: SmokeType) => void;
  spawnThreat: (threatType: ThreatType, numTries?: number, predicate?: (coord: number) => boolean) => number;
  spawnHealthPickup: (predicate?: (coord: number) => boolean) => number,
  spawnWeightLossPickup: (predicate?: (coord: number) => boolean) => number,
  spawnExplosionAt: (x: number, y: number) => void;
}

export abstract class BaseBoss implements Boss {
  protected readonly p5: P5;
  protected readonly gameState: GameState;
  protected readonly loopState: LoopState;
  protected readonly es: EngineState;
  protected readonly threats: AnimationList;
  protected readonly apples: ICollection;
  protected readonly player: PlayerState;
  protected readonly segments: ICollection & IVectorList;
  protected readonly annotations: Record<number, MapAnnotation>;
  protected readonly renderer: Renderer;
  protected readonly spriteRenderer: SpriteRenderer;
  protected readonly difficulty: DifficultyIndex;
  protected readonly sfx: ISFX;
  protected readonly musicPlayer: IMusicPlayer;
  protected readonly startAction: (enumerator: IEnumerator, actionKey: Action) => void;
  protected readonly openDoors: () => void;
  protected readonly spawnRegularApple: () => number;
  protected readonly spawnPuffAt: (x: number, y: number) => void;
  protected readonly spawnSmokeAt: (x: number, y: number, type: SmokeType) => void;
  protected readonly spawnThreat: (threatType: ThreatType, lifetime?: number, predicate?: (coord: number) => boolean) => number;
  protected readonly spawnHealthPickup: (predicate?: (coord: number) => boolean) => number;
  protected readonly spawnWeightLossPickup: (predicate?: (coord: number) => boolean) => number;
  protected readonly spawnExplosionAt: (x: number, y: number) => void;

  protected readonly coroutines: Coroutines;

  public constructor(args: BossConstructorArgs) {
    this.p5 = args.p5;
    this.gameState = args.gameState;
    this.loopState = args.loopState;
    this.es = args.es;
    this.threats = args.threats;
    this.player = args.player;
    this.segments = args.segments;
    this.apples = args.apples;
    this.annotations = args.annotations;
    this.renderer = args.renderer;
    this.spriteRenderer = args.spriteRenderer;
    this.difficulty = args.difficulty;
    this.sfx = args.sfx;
    this.musicPlayer = args.musicPlayer;
    this.startAction = args.startAction;
    this.spawnRegularApple = args.spawnRegularApple;
    this.openDoors = args.openDoors;
    this.spawnPuffAt = args.spawnPuffAt;
    this.spawnSmokeAt = args.spawnSmokeAt;
    this.spawnThreat = args.spawnThreat;
    this.spawnHealthPickup = args.spawnHealthPickup;
    this.spawnWeightLossPickup = args.spawnWeightLossPickup;
    this.spawnExplosionAt = args.spawnExplosionAt;
    this.coroutines = new Coroutines(args.p5);
  }

  protected abstract readonly startScene: Scene;
  protected abstract readonly phases: Record<DifficultyIndex, BossAgro[]>;

  public abstract intro: (...args: BossStartArgs) => Scene;
  public abstract quickIntro: (...args: BossStartArgs) => Scene;
  public abstract start: () => void;
  public abstract tick: (deltaTime: number) => void;
  public abstract draw: (deltaTime: number) => void;

  // public abstract getCurrentState: () => BossStateMachine;
  // public abstract getCurrentPhase: () => BossAgro;
  public abstract cleanup: () => void;
  // public abstract spawnNextItemOverride: () => boolean;

  protected abstract takeDamage: () => void;
  protected abstract die: () => void;
}
