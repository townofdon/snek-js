import { BaseScene } from "@/scenes/BaseScene";
import {
  BossIntro,
  BossStartArgs,
  DifficultyIndex,
  EngineState,
  GameState,
  ICollection,
  IMusicPlayer,
  ISFX,
  ISpriteRenderer,
  IVectorList,
  PlayerState,
} from "@/types";

export abstract class BaseBossScene extends BaseScene {
  protected readonly spriteRenderer: ISpriteRenderer;
  protected type: BossIntro = 0;
  protected readonly gameState: GameState;
  protected readonly es: EngineState;
  protected readonly sfx: ISFX;
  protected readonly player: PlayerState;
  protected readonly segments: ICollection & IVectorList;
  protected readonly difficulty: DifficultyIndex;
  protected readonly musicPlayer: IMusicPlayer;
  protected readonly renderLoop: () => void;
  constructor(...args: BossStartArgs) {
    const [p5, gfx, sfx, es, gameState, player, segments, difficulty, musicPlayer, fonts, spriteRenderer, callbacks, renderLoop] = args;
    requireParam(p5, 'p5');
    requireParam(gfx, 'gfx');
    requireParam(sfx, 'sfx');
    requireParam(musicPlayer, 'musicPlayer');
    requireParam(fonts, 'fonts');
    requireParam(callbacks, 'callbacks');
    requireParam(renderLoop, 'renderLoop');
    super(p5, gfx, fonts, callbacks);
    this.spriteRenderer = spriteRenderer;
    this.sfx = sfx;
    this.es = es;
    this.gameState = gameState;
    this.player = player;
    this.segments = segments;
    this.difficulty = difficulty;
    this.musicPlayer = musicPlayer;
    this.renderLoop = renderLoop;
  }

  intro = () => {
    this.type = BossIntro.Initial;
    this.bindActions();
  }

  quickIntro = () => {
    this.type = BossIntro.Quick;
    this.bindActions();
  }
}

const requireParam = (param: any, name) => {
  if (!param) throw new Error(`[BaseBossScene] ${name} param required`);
}
