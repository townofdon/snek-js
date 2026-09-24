import { BaseBossScene } from "@/boss/BaseBossScene";
import { GRIDCOUNT_X, GRIDCOUNT_Y } from "@/constants";
import { startSceneDialogText, StartSceneDialogTextArgs } from "@/scenes/sceneUtils";
import { BossIntro, BossStartArgs, Image, MapAnnotation, SnekMove, Sound } from "@/types";
import { getCoordIndex, getCoordIndex2, getCoordX, getCoordY } from "@/utils";

const SNEK_ENTER_SPEED = 50;
const BOSS_QUOTES = [
  "Get outa my lab!!",
  "No sneks allowed in here.",
  "Prepare to meet your maker!",
];

export class TechnicianStartScene extends BaseBossScene {
  private showBoss = false;

  constructor(...args: BossStartArgs) {
    super(...args);
  }

  *action() {
    const sfx = this.sfx;
    const { coroutines } = this.props;
    const { gameState, es, player, segments } = this;

    this.showBoss = false;
    const bossCoord = this.getBossCoord();
    gameState.isDeathIlluminating = true;
    es.deathIlluminationMap = {};

    // snek entreunt
    if (this.type === BossIntro.Initial) {
      gameState.isMoving = true;
      const moves: SnekMove[] = [
        { type: 'x', x: 5},
        { type: 'y', y: -3},
        { type: 'x', x: 3},
      ];
      for (let i = moves.length - 1; i >= 0; i--) {
        const move = moves[i];
        if (move.type === 'x'){
          for (let x = 0; x < Math.abs(move.x); x++) {
            player.position.sub(1 * Math.sign(move.x), 0);
          }
        } else if (move.type === 'y') {
          for (let y = 0; y < Math.abs(move.y); y++) {
            player.position.sub(0, 1 * Math.sign(move.y));
          }
        }
      }
      for (let i = 0; i < segments.length; i++) {
        segments.setVec(i, player.position.copy().add(-i - 1, 0));
      }
      yield* coroutines.waitForTime(250);
      const moveSegments = () => {
        for (let i = segments.length - 1; i >= 0; i--) {
          if (i === 0) {
            segments.setVec(i, player.position);
          } else {
            segments.setVec(i, segments.get(i - 1));
          }
        }
      }
      const moveSound = () => {
        if (gameState.steps % 2 === 0) {
          sfx.play(Sound.step1, 0.5);
        } else {
          sfx.play(Sound.step2, 0.5);
        }
        gameState.steps += 1;
      }
      const moveLight = () => {
        es.deathIlluminationMap = {};
        es.deathIlluminationMap[getCoordIndex(player.position)] = true;
        for (let i = 0; i < segments.length; i++) {
          es.deathIlluminationMap[getCoordIndex(segments.get(i))] = true;
        }
      }
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        if (move.type === 'x'){
          for (let x = 0; x < Math.abs(move.x); x++) {
            moveSegments();
            player.position.add(1 * Math.sign(move.x), 0);
            moveLight();
            moveSound();
            yield* coroutines.waitForTime(SNEK_ENTER_SPEED);
          }
        } else if (move.type === 'y') {
          for (let y = 0; y < Math.abs(move.y); y++) {
            moveSegments();
            player.position.add(0, 1 * Math.sign(move.y));
            moveLight();
            moveSound();
            yield* coroutines.waitForTime(SNEK_ENTER_SPEED);
          }
        }
      }
      yield* coroutines.waitForTime(500, undefined, true);
      sfx.play(Sound.switch);
    }

    this.showBoss = true;
    es.deathIlluminationMap[bossCoord] = true;
    es.deathIlluminationMap[bossCoord + 1] = true;
    es.deathIlluminationMap[bossCoord + GRIDCOUNT_X] = true;
    es.deathIlluminationMap[bossCoord + GRIDCOUNT_X + 1] = true;

    sfx.playLoop(Sound.alarm);
    if (this.type === BossIntro.Initial) {
      yield* coroutines.waitForTime(2000, undefined, true);
    } else {
      yield* coroutines.waitForTime(1000, undefined, true);
    }

    sfx.stop(Sound.alarm);
    yield* coroutines.waitForTime(200);

    if (this.type === BossIntro.Initial) {
      const rect = this.getRect(0.5, 0.575, 2 * 250, 2 * 250);
      for (let i = 0; i < BOSS_QUOTES.length; i++) {
        yield* startSceneDialogText({
          p5: this.props.p5,
          gfx: this.props.gfx,
          sfx: this.sfx,
          coroutines: this.props.coroutines,
          fonts: this.props.fonts,
          text: BOSS_QUOTES[i],
          rect,
          delayAfter: 1500,
        } satisfies StartSceneDialogTextArgs);
      }
    }

    sfx.play(Sound.switch);
    gameState.isDeathIlluminating = false;
    es.deathIlluminationMap = {};
    yield* coroutines.waitForTime(500, undefined, true);

    gameState.isMoving = false;
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
    if (this.showBoss) {
      this.spriteRenderer.drawSprite1x1(this.props.gfx, Image.BossTechnician, x, y, 0, 0, 1, 0);
    }
    this.tick();
  };
}
