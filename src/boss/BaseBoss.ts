import {
  Action,
  DifficultyIndex,
  EngineState,
  GameState,
  MapAnnotation,
  PlayerState,
  Scene,
  Sound,
  Boss,
  BossPhase,
  BossStartArgs,
  BossStateMachine,
  IEnumerator,
} from "@/types";
import { Renderer } from "@/engine/renderer";
import { SpriteRenderer } from "@/engine/spriteRenderer";

export interface BossConstructorArgs {
  gameState: GameState;
  es: EngineState;
  playerState: PlayerState;
  annotations: Record<MapAnnotation, Record<number, boolean>>;
  renderer: Renderer;
  spriteRenderer: SpriteRenderer;
  difficulty: DifficultyIndex;
  startAction: (enumerator: IEnumerator, actionKey: Action, force?: boolean) => void,
  playSound: (sound: Sound, vol?: number) => void;
}

export abstract class BaseBoss implements Boss {
  protected readonly gameState: GameState;
  protected readonly es: EngineState;
  protected readonly playerState: PlayerState;
  protected readonly annotations: Record<
    MapAnnotation,
    Record<number, boolean>
  >;
  protected readonly renderer: Renderer;
  protected readonly spriteRenderer: SpriteRenderer;
  protected readonly difficulty: DifficultyIndex;
  protected readonly startAction: (enumerator: IEnumerator, actionKey: Action, force?: boolean) => void;
  protected readonly playSound: (sound: Sound, vol?: number) => void;

  public constructor(args: BossConstructorArgs) {

    this.gameState = args.gameState;
    this.es = args.es;
    this.playerState = args.playerState;
    this.annotations = args.annotations;
    this.renderer = args.renderer;
    this.difficulty = args.difficulty;
    this.startAction = args.startAction;
    this.playSound = args.playSound;
  }

  protected abstract readonly startScene: Scene;
  protected abstract readonly phases: {
    easy: BossPhase[];
    medium: BossPhase[];
    hard: BossPhase[];
    ultra: BossPhase[];
  };

  public abstract getCurrentState: () => BossStateMachine;
  public abstract getCurrentPhase: () => BossPhase;
  public abstract start: (...args: BossStartArgs) => Scene;
  public abstract reset: (...args: BossStartArgs) => Scene;
  public abstract cleanup: () => void;
  public abstract tick: (deltaTime: number) => void;
  public abstract draw: (deltaTime: number) => void;
  public abstract spawnNextItemOverride: () => boolean;
}
