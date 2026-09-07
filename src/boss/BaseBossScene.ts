import { BaseScene } from "@/scenes/BaseScene";
import { BossStartArgs, IMusicPlayer, ISFX } from "@/types";

export abstract class BaseBossScene extends BaseScene {
  protected sfx: ISFX;
  protected musicPlayer: IMusicPlayer;
  protected renderLoop: () => void;
  constructor(...args: BossStartArgs) {
    const [p5, gfx, sfx, musicPlayer, fonts, callbacks, renderLoop] = args;
    requireParam(p5, 'p5');
    requireParam(gfx, 'gfx');
    requireParam(sfx, 'sfx');
    requireParam(musicPlayer, 'musicPlayer');
    requireParam(fonts, 'fonts');
    requireParam(callbacks, 'callbacks');
    requireParam(renderLoop, 'renderLoop');
    super(p5, gfx, fonts, callbacks);
    this.sfx = sfx;
    this.musicPlayer = musicPlayer;
    this.renderLoop = renderLoop;
  }
}

const requireParam = (param: any, name) => {
  if (!param) throw new Error(`[BaseBossScene] ${name} param required`);
}
