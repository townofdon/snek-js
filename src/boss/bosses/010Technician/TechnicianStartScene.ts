import { BaseBossScene } from "@/boss/BaseBossScene";
import { GRIDCOUNT_X, GRIDCOUNT_Y } from "@/constants";
import { startSceneDialogText, StartSceneDialogTextArgs } from "@/scenes/sceneUtils";
import { BossIntro, BossStartArgs, Image, MapAnnotation, Sound } from "@/types";
import { getCoordIndex, getCoordIndex2, getCoordX, getCoordY } from "@/utils";

export class TechnicianStartScene extends BaseBossScene {
  constructor(...args: BossStartArgs) {
    super(...args);
  }

  *action() {
    const sfx = this.sfx;
    const { coroutines } = this.props;
    const { gameState, es, player } = this;


    const bossCoord = this.getBossCoord();
    gameState.isDeathIlluminating = true;
    es.deathIlluminationMap = {};
    es.deathIlluminationMap[getCoordIndex(player.position)] = true;
    es.deathIlluminationMap[bossCoord] = true;
    es.deathIlluminationMap[bossCoord + 1] = true;
    es.deathIlluminationMap[bossCoord + GRIDCOUNT_X] = true;
    es.deathIlluminationMap[bossCoord + GRIDCOUNT_X + 1] = true;

    sfx.playLoop(Sound.alarm);
    if (this.type === BossIntro.Initial) {
      yield* coroutines.waitForTime(2000);
    } else {
      yield* coroutines.waitForTime(1000);
    }

    sfx.play(Sound.switchOff);
    sfx.stop(Sound.alarm);
    yield* coroutines.waitForTime(100);

    if (this.type === BossIntro.Initial) {
      const rect = this.getRect(0.5, 0.575, 2 * 250, 2 * 250);
      yield* startSceneDialogText({
        p5: this.props.p5,
        gfx: this.props.gfx,
        sfx: this.sfx,
        coroutines: this.props.coroutines,
        fonts: this.props.fonts,
        text: "Prepare to meet your maker!",
        rect,
        delayAfter: 1500,
      } satisfies StartSceneDialogTextArgs);
    }

    sfx.play(Sound.switch);
    gameState.isDeathIlluminating = false;
    es.deathIlluminationMap = {};
    if (this.type === BossIntro.Initial) {
      yield* coroutines.waitForTime(1000);
    } else {
      yield* coroutines.waitForTime(500);
    }

    this.cleanup();
  }

  private getBossCoord = () => {
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        if (this.es.level.annotations[coord] === MapAnnotation.L7) {
          return coord;
        }
      }
    }
    return -1;
  }

  keyPressed = () => {};
  draw = () => {
    if (!this.type || !this.isShowing) return;
    this.renderLoop();
    const coord = this.getBossCoord();
    const x = getCoordX(coord);
    const y = getCoordY(coord);
    this.spriteRenderer.drawSprite1x1(this.props.gfx, Image.BossTechnician, x, y, 0, 0, 1, 0);
    this.tick();
  };
}
