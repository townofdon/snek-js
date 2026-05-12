import P5, { Vector } from "p5";
import {
  ANIMATIONS,
  ARMOR_PICKUP_FREEZE_MS,
  BLOCK_SIZE_X,
  BLOCK_SIZE_Y,
  DIMENSIONS,
  ELECTROCUTION_DURATION_MS,
  ELECTROCUTION_FLASH_RATE,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_FLASH_RATE,
  HURT_STUN_TIME,
  INVINCIBILITY_COLOR_CYCLE_MS,
  INVINCIBILITY_EXPIRE_FLASH_MS,
  INVINCIBILITY_EXPIRE_WARN_MS,
  INVINCIBILITY_PICKUP_LIFETIME_MS,
  LASER_DIODE_CRIT_LIFETIME,
  NUM_SNAKE_INVINCIBLE_COLORS,
  PICKUP_EXPIRE_WARN_MS,
  PICKUP_LIFETIME_MS,
  PICKUP_SPRITE_FRAME_MAP,
  STROKE_SIZE,
} from "@/constants";
import {
  DIR,
  DrawSquareOptions,
  DrawState,
  EngineState,
  GameMode,
  GameState,
  GraphicalComponents,
  Outfit,
  PlayerState,
  Replay,
  ReplayMode,
  Image,
  WearableFrame,
  HeldItems,
  PickupType,
  PreyType,
  AppMode,
  LevelType,
  BarrierType,
  Key,
  KeyChannel,
  Lock,
  PickupRarity,
  PortalChannel,
  SegmentFrame,
  LoopState,
  ThreatType,
  Threat16Frame,
  FRAME_COUNT_THREAT_16,
  Threat48Frame,
  FRAME_COUNT_THREAT_48,
  SpritesheetRange,
  LaserType,
  Orientation,
  DamageType,
  ExplosionType,
} from "@/types";
import { UI_CANVAS_RIGHT, UI_PARENT_ID } from "@/ui/ui";
import { Renderer } from "../renderer";
import { PALETTE } from "@/palettes";
import { SpriteRenderer } from "../spriteRenderer";
import {
  checkIsMoving,
  dirToUnitVector,
  getCoordIndex,
  getCoordIndex2,
  getDirectionBetween,
  getRotationFromDirection,
  invertDirection,
  isAtMapEdge,
  isNil,
  lerp,
  shouldBlinkExpiringPickup,
  toRarity,
  triangle,
} from "@/utils";
import { VectorList } from "@/collections/vectorList";
import { Gradients } from "@/collections/gradients";
import { AnimationList } from "@/collections/animationList";
import { PreyList } from "@/collections/preyList";
import { START_LEVEL, START_LEVEL_COBRA } from "@/levels/levelConstants";
import { WARP_ZONE_01 } from "@/levels/bonusLevels/warpZone01";
import { WARP_ZONE_02 } from "@/levels/bonusLevels/warpZone02";
import { WARP_ZONE_03 } from "@/levels/bonusLevels/warpZone03";
import { Emitters } from "@/collections/emitters";
import { Particles } from "@/collections/particles";

interface EngineRenderingArgs {
  p5: P5,
  state: GameState,
  es: EngineState,
  drawState: DrawState,
  loopState: LoopState,
  player: PlayerState,
  segments: VectorList,
  outfit: Outfit,
  heldItems: HeldItems,
  gfxPresentation: P5.Graphics,
  renderer: Renderer,
  spriteRenderer: SpriteRenderer,
  replay: Replay,
  gradients: Gradients,
  reversibleColorGradient: number,
  invincibleColorGradient: number,
  emitters: Emitters,
  particles: Particles,
  emitters10: Emitters,
  particles10: Particles,
}

export function engineRendering({
  p5,
  state,
  es,
  drawState,
  loopState,
  player,
  segments,
  outfit,
  heldItems,
  gfxPresentation,
  renderer,
  spriteRenderer,
  replay,
  gradients,
  reversibleColorGradient,
  invincibleColorGradient,
  emitters,
  particles,
  emitters10,
  particles10,
}: EngineRenderingArgs) {
  // hack P5's "offscreen canvas" to layer multiple canvases for MAX PERF - see: https://p5js.org/reference/#/p5/createGraphics
  const gfxBG: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxExitLights: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxKeysLocks: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxApples: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxFG: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxFGAction: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxLighting: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxUIRight: P5.Graphics = p5.createGraphics(BLOCK_SIZE_X, DIMENSIONS.y, p5.P2D, document.getElementById(UI_CANVAS_RIGHT));
  gfxBG.addClass('static-gfx-canvas').addClass('bg').parent(UI_PARENT_ID).addClass('gfx-bg').id('canvas-bg');
  gfxExitLights.addClass('static-gfx-canvas').addClass('fg0').parent(UI_PARENT_ID).addClass('gfx-exit-lights');
  gfxKeysLocks.addClass('static-gfx-canvas').addClass('fg1').parent(UI_PARENT_ID).addClass('gfx-keys-locks').id('canvas-keys-locks');
  gfxApples.addClass('static-gfx-canvas').addClass('fg1').parent(UI_PARENT_ID).addClass('gfx-apples').id('canvas-apples');
  gfxFG.addClass('static-gfx-canvas').addClass('fg2').parent(UI_PARENT_ID).addClass('gfx-fg').id('canvas-fg');
  gfxFGAction.addClass('static-gfx-canvas').addClass('fg3').parent(UI_PARENT_ID).addClass('gfx-fg-action').id('canvas-action');
  gfxLighting.addClass('static-gfx-canvas').addClass('fg4').parent(UI_PARENT_ID).addClass('gfx-lighting').id('canvas-lighting');
  // move gfxPresentation so that it is on top of everything else
  document.getElementById('gfx-presentation').after(document.getElementById('canvas-lighting'));
  const graphicalComponents: GraphicalComponents = {
    deco1: p5.createGraphics(BLOCK_SIZE_X + STROKE_SIZE*2, BLOCK_SIZE_Y + STROKE_SIZE*2),
    deco2: p5.createGraphics(BLOCK_SIZE_X + STROKE_SIZE*2, BLOCK_SIZE_Y + STROKE_SIZE*2),
    barrier: p5.createGraphics(BLOCK_SIZE_X + STROKE_SIZE*2, BLOCK_SIZE_Y + STROKE_SIZE*2),
    barrierPassable: p5.createGraphics(BLOCK_SIZE_X + STROKE_SIZE*2, BLOCK_SIZE_Y + STROKE_SIZE*2),
    door: p5.createGraphics(BLOCK_SIZE_X + STROKE_SIZE*2, BLOCK_SIZE_Y + STROKE_SIZE*2),
    snakeHead: p5.createGraphics(BLOCK_SIZE_X + STROKE_SIZE*2, BLOCK_SIZE_Y + STROKE_SIZE*2),
    snakeSegment: p5.createGraphics(BLOCK_SIZE_X + STROKE_SIZE*2, BLOCK_SIZE_Y + STROKE_SIZE*2),
    // @ts-ignore
    apple: null,
  };

  const drawPlayerOptions: DrawSquareOptions = { is3d: true, optimize: true };
  const drawPlayerOptionsAcquire: DrawSquareOptions = { is3d: false, optimize: true };
  const drawPlayerOptionsDeath: DrawSquareOptions = { is3d: true, optimize: true, screenshakeMul: -1 };
  const drawAppleOptions: DrawSquareOptions = { size: 0.8, is3d: true, optimize: true, screenshakeMul: 0 };
  const drawInvincibilityPickupOptions: DrawSquareOptions = { size: 0.5, is3d: true, optimize: true };
  const drawReversibilityPickupOptions: DrawSquareOptions = { size: 0.5, is3d: true, optimize: true };
  const drawBasicOptions: DrawSquareOptions = { optimize: true };
  const drawBasicOptionsNoShake: DrawSquareOptions = { optimize: true, screenshakeMul: 0 };
  const drawPortalOptions: DrawSquareOptions = {};

  function initGraphics() {
    [
      p5,
      gfxPresentation,
      gfxBG,
      gfxExitLights,
      gfxKeysLocks,
      gfxApples,
      gfxFG,
      gfxFGAction,
      gfxLighting,
      gfxUIRight,
    ].forEach((gfx: P5.Graphics) => {
      // set pixel density for a perf boost. see - https://p5js.org/reference/p5/pixelDensity/
      gfx.pixelDensity(1);
      gfx.noSmooth();
    });
  }

  function resetGraphics() {
    renderer.invalidateStaticCache();
    gfxBG.clear(0, 0, 0, 0);
    gfxExitLights.clear(0, 0, 0, 0);
    gfxFG.clear(0, 0, 0, 0);
    gfxFGAction.clear(0, 0, 0, 0);
    gfxApples.clear(0, 0, 0, 0);
    gfxKeysLocks.clear(0, 0, 0, 0);
    gfxLighting.clear(0, 0, 0, 0);
    gfxPresentation.clear(0, 0, 0, 0);
    gfxUIRight.clear(0, 0, 0, 0);
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    drawState.shouldDrawActionFG = true;
  }

  function cacheGraphicalComponents() {
    graphicalComponents.barrier.push();
    graphicalComponents.barrier.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.barrier);
    renderer.drawSquareCustom(graphicalComponents.barrier, 0, 0, es.level.colors.barrier, es.level.colors.barrierStroke, drawBasicOptionsNoShake);
    renderer.drawSquareBorderCustom(graphicalComponents.barrier, 0, 0, 'light', es.level.colors.barrierBorderLight, true);
    renderer.drawSquareBorderCustom(graphicalComponents.barrier, 0, 0, 'dark', es.level.colors.barrierBorderDark, true);
    renderer.drawXCustom(graphicalComponents.barrier, 0, 0, es.level.colors.barrierStroke);
    graphicalComponents.barrier.pop();

    graphicalComponents.barrierPassable.push();
    graphicalComponents.barrierPassable.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.barrierPassable);
    renderer.drawSquareCustom(graphicalComponents.barrierPassable, 0, 0, es.level.colors.passableStroke, es.level.colors.passableStroke, drawBasicOptionsNoShake);
    renderer.drawSquareBorderCustom(graphicalComponents.barrierPassable, 0, 0, 'light', es.level.colors.passableBorderLight, true);
    renderer.drawSquareBorderCustom(graphicalComponents.barrierPassable, 0, 0, 'dark', es.level.colors.passableBorderDark, true);
    graphicalComponents.barrierPassable.pop();

    graphicalComponents.door.push();
    graphicalComponents.door.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.door);
    renderer.drawSquareCustom(graphicalComponents.door, 0, 0, es.level.colors.door, es.level.colors.doorStroke, drawBasicOptionsNoShake);
    renderer.drawSquareBorderCustom(graphicalComponents.door, 0, 0, 'light', es.level.colors.doorStroke, false);
    renderer.drawSquareBorderCustom(graphicalComponents.door, 0, 0, 'dark', es.level.colors.doorStroke, false);
    graphicalComponents.door.pop();

    graphicalComponents.snakeHead.push();
    graphicalComponents.snakeHead.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.snakeHead);
    if (state.gameMode === GameMode.Cobra) {
      renderer.drawSquareCustom(graphicalComponents.snakeHead, 0, 0, PALETTE.cobra.playerHead, PALETTE.cobra.playerHead, drawPlayerOptions);
    } else {
      renderer.drawSquareCustom(graphicalComponents.snakeHead, 0, 0, es.level.colors.playerHead, es.level.colors.playerHead, drawPlayerOptions);
    }
    graphicalComponents.snakeHead.pop();

    graphicalComponents.snakeSegment.push();
    graphicalComponents.snakeSegment.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.snakeSegment);
    if (state.gameMode === GameMode.Cobra) {
      renderer.drawSquareCustom(graphicalComponents.snakeSegment, 0, 0, PALETTE.cobra.playerTail, PALETTE.cobra.playerTailStroke, drawPlayerOptions);
    } else {
      renderer.drawSquareCustom(graphicalComponents.snakeSegment, 0, 0, es.level.colors.playerTail, es.level.colors.playerTailStroke, drawPlayerOptions);
    }
    graphicalComponents.snakeSegment.pop();

    graphicalComponents.deco1.push();
    graphicalComponents.deco1.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.deco1);
    renderer.drawSquareCustom(graphicalComponents.deco1, 0, 0, es.level.colors.deco1, es.level.colors.deco1Stroke, drawBasicOptionsNoShake);
    graphicalComponents.deco1.pop();

    graphicalComponents.deco2.push();
    graphicalComponents.deco2.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.deco2);
    renderer.drawSquareCustom(graphicalComponents.deco2, 0, 0, es.level.colors.deco2, es.level.colors.deco2Stroke, drawBasicOptionsNoShake);
    graphicalComponents.deco2.pop();
  }

  function clearBackground() {
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    renderer.invalidateStaticCache();
    drawBackground();
  }

  function drawBackground() {
    const backgroundColor = state.isInvertedColors && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : es.level.colors.background;
    renderer.drawBackground(backgroundColor, gfxBG, gfxFG);
    gfxExitLights.clear(0, 0, 0, 0);
    gfxLighting.clear(0, 0, 0, 0);
    gfxPresentation.clear(0, 0, 0, 0);
    gfxUIRight.clear(0, 0, 0, 0);
    if (drawState.shouldDrawApples) {
      gfxApples.clear(0, 0, 0, 0);
    }
    if (drawState.shouldDrawKeysLocks) {
      gfxKeysLocks.clear(0, 0, 0, 0);
    }
    if (drawState.shouldDrawActionFG) {
      gfxFGAction.clear(0, 0, 0, 0);
    }
  }

  let showPlannedMoves = false;
  function drawPlayerPlannedMoves(
    portalsMap: Record<number, any>,
    checkCollision: (vec: Vector) => DamageType,
  ) {
    if (!es.moves.length) {
      showPlannedMoves = false;
      return;
    }
    if (state.isLost) {
      return;
    }
    if (!showPlannedMoves && es.moves.length < 3 && state.isMoving && checkIsMoving(state, loopState)) {
      return;
    }
    showPlannedMoves = true;
    let pos = player.position.copy();
    let dir = player.direction;
    let numMoves = 0;
    for (let i = 0; i < es.moves.length; i++) {
      const move = es.moves[i];
      const tmp = pos.copy().add(dirToUnitVector(move));
      if (!isNil(portalsMap[getCoordIndex(tmp)]) || checkCollision(tmp)) {
        continue;
      }
      dir = move;
      numMoves++;
      pos.add(dirToUnitVector(move));
      const { frames } = ANIMATIONS[Image.SegmentsSheet];
      spriteRenderer.drawImage1x1(gfxPresentation, Image.SegmentsSheet, pos.x, pos.y, 0, 1, 0, SegmentFrame.Path - 1, frames);
    }
    for (let i = numMoves; i < 5; i++) {
      pos.add(dirToUnitVector(dir));
      if (!isNil(portalsMap[getCoordIndex(pos)]) || checkCollision(pos)) {
        break;
      }
      const { frames } = ANIMATIONS[Image.SegmentsSheet];
      spriteRenderer.drawImage1x1(gfxPresentation, Image.SegmentsSheet, pos.x, pos.y, 0, 1, 0, SegmentFrame.Path - 1, frames);
    }
  }

  function drawPlayerHead(vec: Vector) {
    const electrocuted = state.timeSinceElectrocutionStart < ELECTROCUTION_DURATION_MS && Math.floor(state.timeSinceElectrocutionStart / ELECTROCUTION_FLASH_RATE) % 2 === 0;
    if (state.isInvertedColors) {
      renderer.drawSquareStatic(gfxFG, vec.x, vec.y,
        PALETTE.deathInvert.playerHead,
        PALETTE.deathInvert.playerHead,
        drawPlayerOptionsDeath);
    } else if (!state.isExitingLevel && state.timeSinceInvincibleStart < es.difficulty.invincibilityTime) {
      renderer.drawSquare(vec.x, vec.y, PALETTE.cobra.playerHead, PALETTE.cobra.playerHead, drawPlayerOptions);
    } else if (state.isLost) {
      renderer.drawGraphicalComponent1x1Static(gfxFG, graphicalComponents.snakeHead, vec.x, vec.y, 0.5, -1);
    } else {
      renderer.drawGraphicalComponent1x1Custom(renderer.getMainGfx(), graphicalComponents.snakeHead, vec.x, vec.y);
    }
    const dir: DIR = (!state.isLost && es.moves.length > 0) ? (es.moves[0] as DIR) : player.direction;
    if (state.isLost) {
      spriteRenderer.drawImage3x3Static(gfxFG, Image.SnekHeadDead, vec.x, vec.y, getRotationFromDirection(dir), 1, -1);
      if (replay.mode !== ReplayMode.Playback) {
        // draw wearables
        p5.push();
        let rotation = getRotationFromDirection(dir);
        let wx = vec.x;
        if (dir === DIR.LEFT) {
          rotation = 0;
          p5.scale(-1, 1);
          wx = -wx - 1;
        }
        if (outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfxFGAction, Image.WearablesSheet, wx, vec.y, outfit.exclusive - 1, rotation);
        }
        if (outfit.hair && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfxFGAction, Image.WearablesSheet, wx, vec.y, outfit.hair - 1, rotation);
        }
        p5.pop();
        // show hat, eyewear as scattered across map
        if (outfit.eyes && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfxFGAction, Image.WearablesSheet, wx - 1, vec.y - 1, outfit.eyes - 1, 0);
        }
        if (outfit.hat && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfxFGAction, Image.WearablesSheet, wx + 2, vec.y + 1, outfit.hat - 1, getRotationFromDirection(DIR.DOWN));
        }
      }
    } else {
      const gfx = state.isInvertedColors ? gfxFG : renderer.getMainGfx();
      const x = vec.x;
      const y = vec.y;
      const screenshakeMul = state.isInvertedColors ? -1 : 1;
      if (electrocuted) {
        spriteRenderer.drawSprite1x1(gfx, Image.SegmentsSheet, x, y, SegmentFrame.SkelHead - 1, getRotationFromDirection(dir), 1, screenshakeMul);
      } else {
        spriteRenderer.drawImage3x3Custom(gfx, Image.SnekHead, x, y, getRotationFromDirection(dir), 1, screenshakeMul);
      }
      if (replay.mode !== ReplayMode.Playback) {
        gfx.push();
        let rotation = getRotationFromDirection(dir);
        let wx = x;
        if (dir === DIR.LEFT) {
          rotation = 0;
          gfx.scale(-1, 1);
          wx = -wx - 1;
        }
        if (outfit.hair && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, y, outfit.hair - 1, rotation);
        }
        if (outfit.eyes && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, y, outfit.eyes - 1, rotation);
        }
        if (outfit.back && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, y, outfit.back - 1, rotation);
        }
        if (heldItems.armor > 0) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, y, WearableFrame.Crusher - 1, rotation);
        }
        if (outfit.hat && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, y, outfit.hat - 1, rotation);
        }
        if (outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, y, outfit.exclusive - 1, rotation);
        }
        gfx.pop();
      }
    }
  }

  function drawPlayerSegment(vec: Vector | undefined, i = 0) {
    if (!vec) return;
    if (i >= 1 && vec.equals(segments.get(i - 1))) return;
    const isMiddle = i < segments.length - 1;
    const dirPrev = i === 0
      ? getDirectionBetween(segments.get(i), player.position)
      : getDirectionBetween(segments.get(i), segments.get(i - 1));
    let dirNext = invertDirection(dirPrev);
    let j = i + 1;
    do {
      dirNext = getDirectionBetween(segments.get(i), segments.get(j));
      j++;
    } while (segments.get(i).equals(segments.get(j)) && j < segments.length - 1);
    const cornerNE = isMiddle && (
      (dirPrev === DIR.UP && dirNext === DIR.RIGHT) ||
      (dirPrev === DIR.RIGHT && dirNext === DIR.UP)
    );
    const cornerSE = isMiddle && (
      (dirPrev === DIR.DOWN && dirNext === DIR.RIGHT) ||
      (dirPrev === DIR.RIGHT && dirNext === DIR.DOWN)
    );
    const cornerSW = isMiddle && (
      (dirPrev === DIR.DOWN && dirNext === DIR.LEFT) ||
      (dirPrev === DIR.LEFT && dirNext === DIR.DOWN)
    );
    const cornerNW = isMiddle && (
      (dirPrev === DIR.UP && dirNext === DIR.LEFT) ||
      (dirPrev === DIR.LEFT && dirNext === DIR.UP)
    );
    const x = vec.x;
    const y = vec.y;
    const stunned = state.timeSinceHurt < HURT_STUN_TIME;
    const acquiringArmor = state.timeSinceArmorPickup < 100;
    const armorUsed = state.timeSinceArmorProtection < HURT_STUN_TIME;
    const invincible = !state.isExitingLevel && state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    const electrocuted = state.timeSinceElectrocutionStart < ELECTROCUTION_DURATION_MS && Math.floor(state.timeSinceElectrocutionStart / ELECTROCUTION_FLASH_RATE) % 2 === 0;
    if (electrocuted) {
      const gfx = renderer.getMainGfx();
      if (cornerNE) {
        spriteRenderer.drawSprite1x1(gfx, Image.SegmentsSheet, x, y, SegmentFrame.SkelSegTurn - 1, Math.PI * 0.5, 1);
      } else if (cornerSE) {
        spriteRenderer.drawSprite1x1(gfx, Image.SegmentsSheet, x, y, SegmentFrame.SkelSegTurn - 1, Math.PI * 1, 1);
      } else if (cornerSW) {
        spriteRenderer.drawSprite1x1(gfx, Image.SegmentsSheet, x, y, SegmentFrame.SkelSegTurn - 1, Math.PI * 1.5, 1);
      } else if (cornerNW) {
        spriteRenderer.drawSprite1x1(gfx, Image.SegmentsSheet, x, y, SegmentFrame.SkelSegTurn - 1, Math.PI * 0, 1);
      } else {
        const rotation = (dirPrev === DIR.LEFT || dirPrev === DIR.RIGHT) ? 0 : Math.PI * 0.5;
        spriteRenderer.drawSprite1x1(gfx, Image.SegmentsSheet, x, y, i % 2 === 0 ? SegmentFrame.SkelSegment1 - 1 : SegmentFrame.SkelSegment2 - 1, rotation, 1);
      }
    } else if (stunned) {
      // draw stunned
      if (Math.floor(state.timeSinceHurt / HURT_FLASH_RATE) % 2 === 0) {
        renderer.drawSquare(vec.x, vec.y, "#000", "#000", drawPlayerOptions);
      } else {
        renderer.drawSquare(vec.x, vec.y, "#fff", "#fff", drawPlayerOptions);
      }
    } else if (invincible) {
      // draw invincible
      const timeLeft = es.difficulty.invincibilityTime - state.timeSinceInvincibleStart;
      if (timeLeft < INVINCIBILITY_EXPIRE_WARN_MS && Math.floor(timeLeft / INVINCIBILITY_EXPIRE_FLASH_MS) % 2 === 0) {
        renderer.drawSquare(vec.x, vec.y, "#000", "#000", drawPlayerOptions);
      } else {
        const cycle = Math.floor(state.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
        const color = gradients.calc(invincibleColorGradient, ((i + cycle) % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
        renderer.drawSquare(vec.x, vec.y, color.toString(), color.toString(), drawPlayerOptions);
      }
    } else if (state.isRewinding || armorUsed || acquiringArmor) {
      // draw rewinding
      const cycle = Math.floor(state.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
      const color = gradients.calc(reversibleColorGradient, ((i + cycle) % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
      renderer.drawSquare(vec.x, vec.y, color.toString(), color.toString(), drawPlayerOptions);
      _drawSegmentArmor(vec, i, dirPrev);
    } else if (state.isInvertedColors) {
      renderer.drawSquareStatic(gfxFG, vec.x, vec.y,
        PALETTE.deathInvert.playerTail,
        PALETTE.deathInvert.playerTailStroke,
        drawPlayerOptionsDeath);
      const backgroundColor = state.isInvertedColors && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : es.level.colors.background;
      if (cornerNE) {
        renderer.eraseCorner(gfxFG, backgroundColor, vec.x, vec.y, 'NE', drawPlayerOptionsDeath.screenshakeMul);
      } else if (cornerSE) {
        renderer.eraseCorner(gfxFG, backgroundColor, vec.x, vec.y, 'SE', drawPlayerOptionsDeath.screenshakeMul);
      } else if (cornerSW) {
        renderer.eraseCorner(gfxFG, backgroundColor, vec.x, vec.y, 'SW', drawPlayerOptionsDeath.screenshakeMul);
      } else if (cornerNW) {
        renderer.eraseCorner(gfxFG, backgroundColor, vec.x, vec.y, 'NW', drawPlayerOptionsDeath.screenshakeMul);
      }
    } else {
      const gfx = renderer.getMainGfx();
      // draw normal segment
      if (cornerNE) {
        spriteRenderer.drawImage3x3Custom(gfx, Image.ThemedSegmentNE, vec.x, vec.y, 0, 1, 0);
      } else if (cornerSE) {
        spriteRenderer.drawImage3x3Custom(gfx, Image.ThemedSegmentSE, vec.x, vec.y, 0, 1, 0);
      } else if (cornerSW) {
        spriteRenderer.drawImage3x3Custom(gfx, Image.ThemedSegmentSW, vec.x, vec.y, 0, 1, 0);
      } else if (cornerNW) {
        spriteRenderer.drawImage3x3Custom(gfx, Image.ThemedSegmentNW, vec.x, vec.y, 0, 1, 0);
      } else {
        renderer.drawGraphicalComponent1x1Custom(gfx, graphicalComponents.snakeSegment, vec.x, vec.y);
      }
      // draw decorative segment overlay
      const decoInterval = 9;
      if (i === 0 && state.gameMode === GameMode.Cobra) {
        const direction = invertDirection(player.directionToFirstSegment);
        spriteRenderer.drawImage3x3(Image.SnekSegmentB, vec.x, vec.y, getRotationFromDirection(direction));
      } else if (i === 1) {
        const direction = getDirectionBetween(segments.get(0), segments.get(1));
        spriteRenderer.drawImage3x3(Image.SnekSegmentE, vec.x, vec.y, getRotationFromDirection(direction));
      } else if (i >= decoInterval && (i+2) % decoInterval === 0 && segments.length >= i+4) {
        const direction = getDirectionBetween(segments.get(i + 1), segments.get(i));
        spriteRenderer.drawImage3x3(Image.SnekSegmentE, vec.x, vec.y, getRotationFromDirection(direction));
      } else if (i >= decoInterval && (i+2) % decoInterval === 1 && segments.length >= i+3) {
        const direction = getDirectionBetween(segments.get(i), segments.get(i + 1));
        spriteRenderer.drawImage3x3(Image.SnekSegmentDark, vec.x, vec.y, getRotationFromDirection(direction));
      } else if (i >= decoInterval && (i+2) % decoInterval === 2 && segments.length >= i+2) {
        const direction = getDirectionBetween(segments.get(i), segments.get(i + 1));
        spriteRenderer.drawImage3x3(Image.SnekSegmentE, vec.x, vec.y, getRotationFromDirection(direction));
      }
      _drawSegmentArmor(vec, i, dirPrev);
    }
    if (state.acquireProgression > 0) {
      const color = p5.lerpColor(p5.color('#ffffff00'), p5.color('#ffffffff'), state.acquireProgression);
      renderer.drawSquare(vec.x, vec.y, color.toString(), color.toString(), drawPlayerOptionsAcquire);
    }
  }

  function _drawSegmentArmor(vec: Vector, i = 0, dirPrev: DIR) {
    const numArmoredSegments = 2 * (heldItems.armor - 1) + 1;
    const gfx = renderer.getMainGfx();
    if (heldItems.armor === 1 && replay.mode !== ReplayMode.Playback && i === 1) {
      spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, vec.x, vec.y, WearableFrame.CrusherSeg2 - 1, (getRotationFromDirection(invertDirection(dirPrev))));
    } else if (heldItems.armor > 0 && replay.mode !== ReplayMode.Playback && i > 0 && i < numArmoredSegments) {
      if (i % 2 === 1) {
        spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, vec.x, vec.y, WearableFrame.CrusherSeg1 - 1, (getRotationFromDirection(invertDirection(dirPrev))));
      } else {
        spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, vec.x, vec.y, WearableFrame.CrusherSeg2 - 1, (getRotationFromDirection(invertDirection(dirPrev))));
      }
    }
  }

  function erasePlayerSegmentCorner(vec: Vector | undefined, i = 0) {
    if (!vec) return;
    if (i >= 1 && vec.equals(segments.get(i - 1))) return;
    const stunned = state.timeSinceHurt < HURT_STUN_TIME;
    const acquiringArmor = state.timeSinceArmorPickup < 100;
    const armorUsed = state.timeSinceArmorProtection < HURT_STUN_TIME;
    const invincible = !state.isExitingLevel && state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    const acquiringOther = state.acquireProgression > 0;
    if (!stunned &&
      !armorUsed &&
      !acquiringArmor &&
      !invincible &&
      !state.isRewinding &&
      !state.isInvertedColors &&
      !acquiringOther
    ) {
      return;
    }
    const isMiddle = i < segments.length - 1;
    const dirPrev = i === 0
      ? getDirectionBetween(segments.get(i), player.position)
      : getDirectionBetween(segments.get(i), segments.get(i - 1));
    const dirNext = getDirectionBetween(segments.get(i), segments.get(i + 1));
    const cornerNE = isMiddle && (
      (dirPrev === DIR.UP && dirNext === DIR.RIGHT) ||
      (dirPrev === DIR.RIGHT && dirNext === DIR.UP)
    );
    const cornerSE = isMiddle && (
      (dirPrev === DIR.DOWN && dirNext === DIR.RIGHT) ||
      (dirPrev === DIR.RIGHT && dirNext === DIR.DOWN)
    );
    const cornerSW = isMiddle && (
      (dirPrev === DIR.DOWN && dirNext === DIR.LEFT) ||
      (dirPrev === DIR.LEFT && dirNext === DIR.DOWN)
    );
    const cornerNW = isMiddle && (
      (dirPrev === DIR.UP && dirNext === DIR.LEFT) ||
      (dirPrev === DIR.LEFT && dirNext === DIR.UP)
    );
    const gfx = renderer.getMainGfx();
    const backgroundColor = state.isInvertedColors && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : es.level.colors.background;
    if (cornerNE) {
      renderer.eraseCorner(gfx, backgroundColor, vec.x, vec.y, 'NE', 1);
    } else if (cornerSE) {
      renderer.eraseCorner(gfx, backgroundColor, vec.x, vec.y, 'SE', 1);
    } else if (cornerSW) {
      renderer.eraseCorner(gfx, backgroundColor, vec.x, vec.y, 'SW', 1);
    } else if (cornerNW) {
      renderer.eraseCorner(gfx, backgroundColor, vec.x, vec.y, 'NW', 1);
    }
  }

  function drawApple(x: number, y: number) {
    const isInvincibility = es.pickupsMap[getCoordIndex2(x, y)]?.type === PickupType.Invincibility;
    const isReversibility = es.pickupsMap[getCoordIndex2(x, y)]?.type === PickupType.Reversibility;
    const timeLeft = es.pickupsMap[getCoordIndex2(x, y)]?.lifetime || 0;
    const specialPickupType = es.pickupsMap[getCoordIndex2(x, y)]?.type || PickupType.None;
    if (state.isInvertedColors && replay.mode !== ReplayMode.Playback && isInvincibility) {
      renderer.drawSquare(x, y,
        PALETTE.deathInvert.apple,
        PALETTE.deathInvert.appleStroke,
        drawAppleOptions);
    } else if (isInvincibility) {
      if (shouldBlinkExpiringPickup(timeLeft)) {
        return;
      }
      const cycle = Math.floor(state.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
      const color = gradients.calc(invincibleColorGradient, (cycle % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
      renderer.drawSquare(x, y, color.toString(), color.toString(), drawInvincibilityPickupOptions);
      if (timeLeft <= INVINCIBILITY_PICKUP_LIFETIME_MS) {
        spriteRenderer.drawImage3x3(Image.PickupArrows, x, y);
      }
    } else if (isReversibility) {
      if (shouldBlinkExpiringPickup(timeLeft)) {
        return;
      }

      const cycle = Math.floor(state.actualTimeElapsed / ANIMATIONS[Image.PickupsSheet].timePerFrame) % 2;
      if (!cycle) {
        spriteRenderer.drawSprite1x1(renderer.getMainGfx(), Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[PickupType.Reversibility] - 1);
      } else {
        spriteRenderer.drawSprite1x1(renderer.getMainGfx(), Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[PickupType.Reversibility]);
      }
      // const color = gradients.calc(reversibleColorGradient, (cycle % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
      // renderer.drawSquare(x, y, color.toString(), color.toString(), drawReversibilityPickupOptions);
      if (timeLeft <= PICKUP_LIFETIME_MS) {
        spriteRenderer.drawImage3x3(Image.PickupArrows, x, y);
      }
    } else if (specialPickupType === PickupType.HealthPack || specialPickupType === PickupType.WeightLossPill) {
      if (shouldBlinkExpiringPickup(timeLeft)) {
        return;
      }
      spriteRenderer.drawSprite1x1(renderer.getMainGfx(), Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[specialPickupType] - 1);
      if (timeLeft <= PICKUP_LIFETIME_MS) {
        spriteRenderer.drawImage3x3(Image.PickupArrows, x, y);
      }
    } else if (specialPickupType && drawState.shouldDrawApples) {
      spriteRenderer.drawSprite1x1(gfxApples, Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[specialPickupType] - 1);
    } else if (!specialPickupType) {
      const elapsed = state.actualTimeElapsed;
      const { durations } = ANIMATIONS[Image.ThemedAppleSheet];
      const totalDuration = durations.reduce((a, b) => a + b, 0);
      const t = elapsed % totalDuration;
      // get current frame
      let frame = 0;
      let sum = 0;
      for (let i = 0; i < durations.length; i++) {
        sum += durations[i];
        if (t < sum) {
          frame = i;
          break;
        }
      }
      spriteRenderer.drawSprite1x1(renderer.getMainGfx(), Image.ThemedAppleSheet, x, y, frame, 0, 1);
    }
  }

  function drawThreats(threats: AnimationList) {
    if (drawState.shouldDrawActionFG) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (threats.existsAtCoord(coord, ThreatType.Mine)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = threats.getElapsedByCoord(coord);
          if (shouldBlinkExpiringPickup(threats.getTimeRemaining(x, y))) {
            continue;
          }
          spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.MineSheet, x, y, elapsed);
        } else if (threats.existsAtCoord(coord, ThreatType.LaserDiode)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = threats.getElapsedByCoord(coord);
          if (threats.getTimeRemaining(x, y) <= LASER_DIODE_CRIT_LIFETIME) {
            spriteRenderer.drawSpritesheetAnim1x1(gfxFGAction, SpritesheetRange.DiodeCrit, x, y, elapsed);
          } else {
            spriteRenderer.drawSpritesheetAnim1x1(gfxFGAction, SpritesheetRange.DiodeBlue, x, y, elapsed);
          }
        } else if (threats.existsAtCoord(coord, ThreatType.ExplodableBarrel)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = threats.getElapsedByCoord(coord);
          if (threats.getTimeRemaining(x, y) <= PICKUP_EXPIRE_WARN_MS) {
            spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, SpritesheetRange.BarrelFireB, x, y, elapsed);
          } else {
            spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, SpritesheetRange.Barrel, x, y, elapsed);
          }
        }
      }
    }
  }

  function drawLasers() {
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        const gfxlsr = renderer.getMainGfx();
        const laser = es.lasersMap[coord];
        if (laser?.type === LaserType.Blue) {
          const frames = [
            Threat16Frame.LaserBlue0,
            Threat16Frame.LaserBlue1,
            Threat16Frame.LaserBlue2,
            Threat16Frame.LaserBlue3,
          ];
          const frame = Math.floor(renderer.getElapsed() / 200) % frames.length;
          const laserFrame = frames[frame] - 1;
          if (laser.orientation === Orientation.Mixed || laser.orientation === Orientation.Horizontal) {
            spriteRenderer.drawImage1x1(gfxlsr, Image.ThreatSheet16, x, y, 0, 1, 0, laserFrame, FRAME_COUNT_THREAT_16);
          }
          if (laser.orientation === Orientation.Mixed || laser.orientation === Orientation.Vertical) {
            spriteRenderer.drawImage1x1(gfxlsr, Image.ThreatSheet16, x, y, 0.5 * Math.PI, 1, 0, laserFrame, FRAME_COUNT_THREAT_16);
          }
        } else if (laser?.type === LaserType.Red) {
          const frames = [
            Threat16Frame.LaserRed0,
            Threat16Frame.LaserRed1,
            Threat16Frame.LaserRed2,
            Threat16Frame.LaserRed3,
          ];
          const frame = Math.floor(renderer.getElapsed() / 200) % frames.length;
          const laserFrame = frames[frame] - 1;
          if (laser.orientation === Orientation.Mixed || laser.orientation === Orientation.Horizontal) {
            spriteRenderer.drawImage1x1(gfxlsr, Image.ThreatSheet16, x, y, 0, 1, 0, laserFrame, FRAME_COUNT_THREAT_16);
          }
          if (laser.orientation === Orientation.Mixed || laser.orientation === Orientation.Vertical) {
            spriteRenderer.drawImage1x1(gfxlsr, Image.ThreatSheet16, x, y, 0.5 * Math.PI, 1, 0, laserFrame, FRAME_COUNT_THREAT_16);
          }
        }
      }
    }
  }

  function drawPrey(preyList: PreyList) {
    if (drawState.shouldDrawActionFG) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (preyList.existsAtCoord(coord)) {
          let x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          if (shouldBlinkExpiringPickup(preyList.getTimeRemaining(x, y))) {
            continue;
          }
          const flipx = preyList.getFlipX(x, y);
          const elapsed = preyList.getElapsed(x, y);
          const preyType = preyList.getTypeByCoord(coord);
          gfxFGAction.push();
          if (flipx) {
            gfxFGAction.scale(-1, 1);
            x = -x - 1;
          }
          switch (preyType) {
            case PreyType.Grub:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.PreyGrubSheet, x, y, elapsed);
              break;
            case PreyType.FieldMouse:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.PreyMouseSheet, x, y, elapsed);
              break;
            case PreyType.Ant:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.PreyAntSheet, x, y, elapsed);
              break;
            case PreyType.Grasshopper:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.PreyGrasshopperSheet, x, y, elapsed);
              break;
          }
          gfxFGAction.pop();
        }
      }
    }
  }

  function drawFireTiles(fireTiles: AnimationList) {
    if (drawState.shouldDrawActionFG && !state.isInvertedColors) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (fireTiles.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = fireTiles.getElapsedByCoord(coord);
          spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.FireSheet, x, y, elapsed);
        }
      }
    }
  }

  function drawExplosions(explosions: AnimationList) {
    if (drawState.shouldDrawActionFG) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (explosions.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = explosions.getElapsedByCoord(coord);
          const type = explosions.getTypeByCoord(coord) as ExplosionType;
          switch (type) {
            case ExplosionType.Small:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.ExplosionSheet, x, y, elapsed);
              break;
            case ExplosionType.Large:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Explosion3Sheet, x, y, elapsed);
              break;
          }
        }
      }
    }
  }

  function drawPuffs(puffs: AnimationList) {
    if (drawState.shouldDrawActionFG) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (puffs.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = puffs.getElapsedByCoord(coord);
          spriteRenderer.drawSpritesheetAnim1x1(gfxFGAction, Image.PuffSheet, x, y, elapsed);
        }
      }
    }
  }

  function drawPickupOutlines(pickupOutlines: AnimationList) {
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      if (pickupOutlines.existsAtCoord(coord)) {
        const x = Math.floor(coord % GRIDCOUNT_X);
        const y = Math.floor(coord / GRIDCOUNT_X);
        const elapsed = pickupOutlines.getElapsedByCoord(coord);
        const rarity = toRarity(pickupOutlines.getTypeByCoord(coord));
        switch (rarity) {
          case PickupRarity.Galactic:
          case PickupRarity.Legendary:
            spriteRenderer.drawSpritesheetAnim3x3(renderer.getMainGfx(), Image.PickupOutlineYellowSheet, x, y, elapsed);
            break;
          case PickupRarity.Epic:
            spriteRenderer.drawSpritesheetAnim3x3(renderer.getMainGfx(), Image.PickupOutlineBlueSheet, x, y, elapsed);
            break;
          case PickupRarity.Rare:
          case PickupRarity.Common: 
          case PickupRarity.None:
          default:
            break;
        }
      }
    }
  }

  function drawShields(shieldSpawns: AnimationList, shields: AnimationList) {
    if (drawState.shouldDrawActionFG) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (shieldSpawns.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = shieldSpawns.getElapsedByCoord(coord);
          spriteRenderer.drawSpritesheetAnim1x1(gfxFGAction, Image.ShieldSpawn, x, y, elapsed);
        } else if (shields.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = shields.getElapsedByCoord(coord);
          if (shouldBlinkExpiringPickup(shields.getTimeRemaining(x, y))) {
            continue;
          }
          spriteRenderer.drawSpritesheetAnim1x1(gfxFGAction, Image.Shield, x, y, elapsed);
        }
      }
    }
  }

  function drawExitLights() {
    if (state.appMode !== AppMode.Game) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (!state.isDoorsOpen && (es.level.type || 0) === LevelType.Level) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    if (state.isGameWon) return;

    let exitCount = 0;
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        if (x !== 0 && y !== 0 && x !== GRIDCOUNT_X - 1 && y !== GRIDCOUNT_Y - 1) continue;
        const coord = getCoordIndex2(x, y);
        if (es.barriersMap[coord] && !es.passablesMap[coord]) continue;
        if (es.portalsMap[coord]) continue;
        if (es.nospawnsMap[coord] && !es.locksMap[coord]) continue;
        exitCount++;
      }
    }
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        if (x !== 0 && y !== 0 && x !== GRIDCOUNT_X - 1 && y !== GRIDCOUNT_Y - 1) continue;
        const coord = getCoordIndex2(x, y);
        if (es.barriersMap[coord] && !es.passablesMap[coord]) continue;
        if (es.portalsMap[coord]) continue;
        if (es.nospawnsMap[coord] && !es.locksMap[coord]) continue;
        const lightIndex = (i: number) => {
          return Math.round(lerp(0, 4, triangle((i + 6) / 4)))
        }
        const secondaryLightAlpha = 0.3;
        if (x === 0) {
          renderer.drawExitLight(gfxExitLights, x + 1, y, DIR.RIGHT, lightIndex(y), 1);
          if (exitCount <= 60) {
            renderer.drawExitLight(gfxExitLights, x + 2, y, DIR.RIGHT, lightIndex(y), secondaryLightAlpha);
          }
        }
        if (x === GRIDCOUNT_X - 1) {
          renderer.drawExitLight(gfxExitLights, x - 1, y, DIR.LEFT, lightIndex(y), 1);
          if (exitCount <= 60) {
            renderer.drawExitLight(gfxExitLights, x - 2, y, DIR.LEFT, lightIndex(y), secondaryLightAlpha);
          }
        }
        if (y === 0) {
          renderer.drawExitLight(gfxExitLights, x, y + 1, DIR.DOWN, lightIndex(x), 1);
          if (exitCount <= 60) {
            renderer.drawExitLight(gfxExitLights, x, y + 2, DIR.DOWN, lightIndex(x), secondaryLightAlpha);
          }
        }
        if (y === GRIDCOUNT_Y - 1) {
          renderer.drawExitLight(gfxExitLights, x, y - 1, DIR.UP, lightIndex(x), 1);
          if (exitCount <= 60) {
            renderer.drawExitLight(gfxExitLights, x, y - 2, DIR.UP, lightIndex(x), secondaryLightAlpha);
          }
        }
      }
    }
  }

  function drawBarriers() {
    if (!state.isInvertedColors || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < es.barriers.length; i++) {
        if (state.isDoorsOpen && es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
        const x = es.barriers[i].vec.x;
        const y = es.barriers[i].vec.y;
        const gfx = gfxFG;
        switch (es.barriers[i].type) {
          case BarrierType.FireTile:
            // handled by drawFireTiles()
            break;
          case BarrierType.Skull:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 0);
            break;
          case BarrierType.SkullThemed:
            spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierSkull, x, y, 0, 1, 0);
            break;
          case BarrierType.Indent:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 2);
            break;
          case BarrierType.IndentThemed:
            spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierIndent, x, y, 0, 1, 0);
            break;
          case BarrierType.Flat:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 4);
            break;
          case BarrierType.FlatThemed:
            spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierFlat, x, y, 0, 1, 0);
            break;
          case BarrierType.Pyramid:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 6);
            break;
          case BarrierType.PyramidThemed:
            spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierPyramid, x, y, 0, 1, 0);
            break;
          case BarrierType.ExitSign:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 11);
            break;
          case BarrierType.Radar:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 12);
            break;
          case BarrierType.ComputerChip:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 13);
            break;
          case BarrierType.MetalPlate:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 14);
            break;
          case BarrierType.Panel0:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 15);
            break;
          case BarrierType.Panel1:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 16);
            break;
          case BarrierType.Panel2:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 17);
            break;
          case BarrierType.Panel3:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 18);
            break;
          case BarrierType.Panel4:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 19);
            break;
          case BarrierType.Panel5:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 20);
            break;
          case BarrierType.Brick:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 21);
            break;
          case BarrierType.BrickWhite:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 22);
            break;
          case BarrierType.BrickThemed:
            spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierBrick, x, y, 0, 1, 0);
            break;
          case BarrierType.Stone:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 24);
            break;
          case BarrierType.StoneThemed:
            spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierStone, x, y, 0, 1, 0);
            break;
          case BarrierType.PanelWhite:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 27);
            break;
          case BarrierType.CompPanel:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 28);
            break;
          case BarrierType.GrateWhite:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 29);
            break;
          case BarrierType.GrateYellow:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 30);
            break;
          case BarrierType.Ruby:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 31);
            break;
          case BarrierType.FanDuct:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 32);
            break;
          case BarrierType.ExhaustPlate:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 33);
            break;
          case BarrierType.MetalPlate2:
            spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 34);
            break;
          default:
          case BarrierType.Unset:
          case BarrierType.Default:
            renderer.drawGraphicalComponent1x1Static(gfxFG, graphicalComponents.barrier, x, y, 1, 0);
            break;
        }
      }
      return;
    }

    for (let i = 0; i < es.barriers.length; i++) {
      if (state.isDoorsOpen && es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquareStatic(gfxFG, es.barriers[i].vec.x, es.barriers[i].vec.y, PALETTE.deathInvert.barrier, PALETTE.deathInvert.barrierStroke, drawBasicOptionsNoShake);
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (state.isDoorsOpen && es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquareBorderStatic(gfxFG, es.barriers[i].vec.x, es.barriers[i].vec.y, 'light', PALETTE.deathInvert.barrierStroke, false, 0);
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (state.isDoorsOpen && es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquareBorderStatic(gfxFG, es.barriers[i].vec.x, es.barriers[i].vec.y, 'dark', PALETTE.deathInvert.barrierStroke, false, 0);
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (state.isDoorsOpen && es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawXStatic(gfxFG, es.barriers[i].vec.x, es.barriers[i].vec.y, PALETTE.deathInvert.barrierStroke, 5, 0);
    }
  }

  function drawPassableBarriers() {
    if (!state.isDoorsOpen) return;
    if (!state.isInvertedColors || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < es.barriers.length; i++) {
        if (!es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
        renderer.drawGraphicalComponent1x1Static(gfxFG, graphicalComponents.barrierPassable, es.barriers[i].vec.x, es.barriers[i].vec.y, 1, 0);
        // draw passable glass overlay
        if (!es.keysMap[getCoordIndex(es.barriers[i].vec)]) {
          spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, es.barriers[i].vec.x, es.barriers[i].vec.y, 10);
        }
      }
      return;
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (!es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquare(es.barriers[i].vec.x, es.barriers[i].vec.y, PALETTE.deathInvert.barrier, PALETTE.deathInvert.barrierStroke, drawBasicOptions);
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (!es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquareBorder(es.barriers[i].vec.x, es.barriers[i].vec.y, 'light', PALETTE.deathInvert.barrierStroke, true);
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (!es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquareBorder(es.barriers[i].vec.x, es.barriers[i].vec.y, 'dark', PALETTE.deathInvert.barrierStroke, true);
    }
  }

  function drawDoors(doorsOpening: AnimationList) {
    if (!state.isInvertedColors || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < es.doors.length; i++) {
        const x = es.doors[i].x;
        const y = es.doors[i].y;
        const isThemedDoor = isAtMapEdge(x, y, 1);
        const isNonDoorLevel = false
          || es.level === START_LEVEL
          || es.level === START_LEVEL_COBRA
          || es.level === WARP_ZONE_01
          || es.level === WARP_ZONE_02
          || es.level === WARP_ZONE_03;
        if (isThemedDoor && !isNonDoorLevel) {
          spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedDoor, x, y, 0, 1, 0);
        } else if (!isNonDoorLevel) {
          spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedDoorAlt, x, y, 0, 1, 0);
        } else {
          renderer.drawGraphicalComponent1x1Static(gfxFG, graphicalComponents.door, x, y, 1, 0);
        }
      }
      // door open effect
      if (state.isDoorsOpen && drawState.shouldDrawActionFG) {
        const lifetime = ANIMATIONS[Image.DoorOpenSheet].frames * ANIMATIONS[Image.DoorOpenSheet].timePerFrame
        for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
          if (doorsOpening.existsAtCoord(coord)) {
            const x = Math.floor(coord % GRIDCOUNT_X);
            const y = Math.floor(coord / GRIDCOUNT_X);
            const elapsed = doorsOpening.getElapsedByCoord(coord);
            if (elapsed < lifetime) {
              spriteRenderer.drawSpritesheetAnim1x1(gfxFGAction, Image.DoorOpenSheet, x, y, elapsed);
            }
          }
        }
      }
      return;
    }
    for (let i = 0; i < es.doors.length; i++) {
      renderer.drawSquare(es.doors[i].x, es.doors[i].y, PALETTE.deathInvert.door, PALETTE.deathInvert.doorStroke, drawBasicOptions);
    }
    for (let i = 0; i < es.doors.length; i++) {
      renderer.drawSquareBorder(es.doors[i].x, es.doors[i].y, 'light', PALETTE.deathInvert.doorStroke);
    }
    for (let i = 0; i < es.doors.length; i++) {
      renderer.drawSquareBorder(es.doors[i].x, es.doors[i].y, 'dark', PALETTE.deathInvert.doorStroke);
    }
  }

  function drawKey(key: Key) {
    if (!state.isDoorsOpen && es.passablesMap[getCoordIndex(key.position)]) return;
    if (!drawState.shouldDrawKeysLocks && !state.isInvertedColors) return;
    const x = key.position.x;
    const y = key.position.y;
    if (state.isInvertedColors) {
      spriteRenderer.drawSprite1x1(renderer.getMainGfx(), Image.KeySheet, x, y, 0, 0, 1);
    } else if (key.channel === KeyChannel.Yellow) {
      spriteRenderer.drawSprite1x1(gfxKeysLocks, Image.KeySheet, x, y, 3, 0, 1);
    } else if (key.channel === KeyChannel.Red) {
      spriteRenderer.drawSprite1x1(gfxKeysLocks, Image.KeySheet, x, y, 2, 0, 1);
    } else if (key.channel === KeyChannel.Blue) {
      spriteRenderer.drawSprite1x1(gfxKeysLocks, Image.KeySheet, x, y, 1, 0, 1);
    }
  }

  function drawLock(lock: Lock) {
    if (!drawState.shouldDrawKeysLocks && !state.isInvertedColors) return;
    const x = lock.position.x;
    const y = lock.position.y;
    if (state.isInvertedColors) {
      spriteRenderer.drawSprite1x1(renderer.getMainGfx(), Image.LockSheet, x, y, 0, 0, 1);
    } else if (lock.channel === KeyChannel.Yellow) {
      spriteRenderer.drawSprite1x1(gfxKeysLocks, Image.LockSheet, x, y, 3, 0, 1);
    } else if (lock.channel === KeyChannel.Red) {
      spriteRenderer.drawSprite1x1(gfxKeysLocks, Image.LockSheet, x, y, 2, 0, 1);
    } else if (lock.channel === KeyChannel.Blue) {
      spriteRenderer.drawSprite1x1(gfxKeysLocks, Image.LockSheet, x, y, 1, 0, 1);
    }
  }

  function drawDecorative1(vec: Vector) {
    if (!state.isInvertedColors || replay.mode === ReplayMode.Playback) {
      renderer.drawGraphicalComponent1x1Static(gfxBG, graphicalComponents.deco1, vec.x, vec.y, 1, 0);
      // renderer.drawSquareStatic(gfxBG, vec.x, vec.y, es.level.colors.deco1, es.level.colors.deco1Stroke, drawBasicOptionsNoShake);
    } else {
      renderer.drawSquare(vec.x, vec.y, PALETTE.deathInvert.deco1, PALETTE.deathInvert.deco1Stroke, drawBasicOptions);
    }
  }

  function drawDecorative2(vec: Vector) {
    if (!state.isInvertedColors || replay.mode === ReplayMode.Playback) {
      renderer.drawGraphicalComponent1x1Static(gfxBG, graphicalComponents.deco2, vec.x, vec.y, 1, 0);
      // renderer.drawSquareStatic(gfxBG, vec.x, vec.y, es.level.colors.deco2, es.level.colors.deco2Stroke, drawBasicOptionsNoShake);
    } else {
      renderer.drawSquare(vec.x, vec.y, PALETTE.deathInvert.deco2, PALETTE.deathInvert.deco2Stroke, drawBasicOptions);
    }
  }

  function drawParticlesTest(coord: number) {
    if (es.barriersMap[coord] && !es.passablesMap[coord]) return false;
    if (es.doorsMap[coord]) return false;
    if (es.portalsMap[coord]) return false;
    if (es.locksMap[coord]) return false;
    if (segments.containsCoord(coord)) return false;
    return true;
  }

  function drawParticles(zIndexPass = 0) {
    if (state.isInvertedColors) return;
    if (zIndexPass < 10) {
      emitters.tick(p5.deltaTime);
      particles.tick(p5.deltaTime, drawParticlesTest);
    } else if (zIndexPass < 20) {
      emitters10.tick(p5.deltaTime);
      particles10.tick(p5.deltaTime);
    }
  }

  function drawPointsText(pointsAnim: AnimationList) {
    if (state.timeSinceArmorPickup < ARMOR_PICKUP_FREEZE_MS) return;
    if (drawState.shouldDrawActionFG) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (pointsAnim.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = pointsAnim.getElapsedByCoord(coord);
          const rarity = toRarity(pointsAnim.getType(x, y))
          switch (rarity) {
            case PickupRarity.Common:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Points500, x, y, elapsed);
              break;
            case PickupRarity.Rare:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Points1000, x, y, elapsed);
              break;
            case PickupRarity.Epic:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Points2000, x, y, elapsed);
              break;
            case PickupRarity.Legendary:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Points5000, x, y, elapsed);
              break;
            case PickupRarity.Galactic:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Points10000, x, y, elapsed);
              break;
            default:
              break;
          }
        }
      }
    }
  }

  function drawPortals() {
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < es.portals[i as PortalChannel].length; j++) {
        const portalPosition = es.portals[i as PortalChannel][j];
        if (!portalPosition) continue;
        const portal = es.portalsMap[getCoordIndex(portalPosition)];
        if (!portal) continue;
        renderer.drawPortal(portal, state.isInvertedColors && replay.mode !== ReplayMode.Playback, drawPortalOptions, gfxBG);
        // if (drawState.shouldDrawKeysLocks) {
        //   spriteRenderer.drawImage3x3Custom(gfxKeysLocks, Image.ThemedPortalColumns, portalPosition.x, portalPosition.y, 0, 1, 0);
        // }
      }
    }
  }

  return {
    gfxBG,
    gfxExitLights,
    gfxKeysLocks,
    gfxApples,
    gfxFG,
    gfxFGAction,
    gfxLighting,
    gfxUIRight,
    initGraphics,
    resetGraphics,
    cacheGraphicalComponents,
    clearBackground,
    drawBackground,
    drawPlayerPlannedMoves,
    drawPlayerHead,
    drawPlayerSegment,
    erasePlayerSegmentCorner,
    drawApple,
    drawThreats,
    drawLasers,
    drawPrey,
    drawFireTiles,
    drawExplosions,
    drawPuffs,
    drawShields,
    drawPickupOutlines,
    drawExitLights,
    drawBarriers,
    drawPassableBarriers,
    drawDoors,
    drawKey,
    drawLock,
    drawDecorative1,
    drawDecorative2,
    drawParticles,
    drawPointsText,
    drawPortals,
  };
}
