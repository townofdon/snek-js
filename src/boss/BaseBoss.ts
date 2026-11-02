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
  IMusicPlayer,
  BossStateMachine,
  Context,
  IAnimationList,
  IRenderer,
  ISpriteRenderer,
} from "@/types";
import { Coroutines } from "@/engine/coroutines";

export interface BossConstructorArgs {
  ctx: Context,
  gameState: GameState;
  annotations: Record<number, MapAnnotation>;
  renderer: IRenderer;
  spriteRenderer: ISpriteRenderer;
  difficulty: DifficultyIndex;
  sfx: ISFX;
  musicPlayer: IMusicPlayer;
}

export abstract class BaseBoss implements Boss {
  protected readonly ctx: Context;
  protected readonly p5: P5;
  protected readonly gameState: GameState;
  protected readonly loopState: LoopState;
  protected readonly es: EngineState;
  protected readonly threats: IAnimationList;
  protected readonly apples: ICollection;
  protected readonly player: PlayerState;
  protected readonly segments: IVectorList;
  protected readonly annotations: Record<number, MapAnnotation>;
  protected readonly renderer: IRenderer;
  protected readonly spriteRenderer: ISpriteRenderer;
  protected readonly difficulty: DifficultyIndex;
  protected readonly sfx: ISFX;
  protected readonly musicPlayer: IMusicPlayer;
  protected readonly startAction: (enumerator: IEnumerator, actionKey: Action) => void;

  protected readonly coroutines: Coroutines;

  public constructor(args: BossConstructorArgs) {
    this.ctx = args.ctx;
    this.p5 = args.ctx.p5;
    this.gameState = args.gameState;
    this.loopState = args.ctx.loopState;
    this.es = args.ctx.es;
    this.threats = args.ctx.threats;
    this.player = args.ctx.player;
    this.segments = args.ctx.segments;
    this.apples = args.ctx.apples;
    this.annotations = args.annotations;
    this.renderer = args.renderer;
    this.spriteRenderer = args.spriteRenderer;
    this.difficulty = args.difficulty;
    this.sfx = args.sfx;
    this.musicPlayer = args.musicPlayer;
    this.startAction = args.ctx.startAction;
    this.coroutines = new Coroutines(args.ctx.p5);
  }

  protected abstract readonly startScene: Scene;
  protected abstract readonly phases: Record<DifficultyIndex, BossAgro[]>;

  public abstract getHP: () => number;
  public abstract getStateMachine: () => BossStateMachine;
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
