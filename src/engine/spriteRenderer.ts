import P5, { Vector } from "p5";
import Color from "color";

import {
  ScreenShakeState,
  Image,
  ExtendedPalette,
  SpritesheetImage,
  ThemedImage,
  ColorReplacementPalette,
  SpritesheetRange,
} from "../types";
import { ANIMATIONS, BLOCK_SIZE_X, BLOCK_SIZE_Y, IMG_SCALE, IMG_X_OFFSET, MAP_OFFSET, STROKE_SIZE } from "../constants";
import { getCurrentFrame, getRelativeDir, lerp, isValidSpritesheetRange } from "../utils";
import { getBorderColorVariant } from "@/palettes";

interface SpriteRendererConstructorProps {
  p5: P5
  screenShake?: ScreenShakeState
}

export class SpriteRenderer {
  private p5: P5 = null;
  private screenShake: ScreenShakeState = null;

  private isStaticCached = false;

  private images: Record<Image, P5.Image | null> = {
    [Image.__TEST__]: null,
    [Image.ControlsKeyboardDelete]: null,
    [Image.ControlsKeyboardMove]: null,
    [Image.ControlsKeyboardTurn]: null,
    [Image.ControlsKeyboardSprint]: null,
    [Image.ControlsGamepadRewind]: null,
    [Image.ControlsGamepadMove]: null,
    [Image.ControlsGamepadTurn]: null,
    [Image.ControlsGamepadSprint]: null,
    [Image.ControlsMouseLeft]: null,
    [Image.ThemedAppleSheet]: null,
    [Image.ThemedBarrierSkull]: null,
    [Image.ThemedBarrierIndent]: null,
    [Image.ThemedDoor]: null,
    [Image.ThemedDoorAlt]: null,
    [Image.ThemedSegmentNE]: null,
    [Image.ThemedSegmentSE]: null,
    [Image.ThemedSegmentSW]: null,
    [Image.ThemedSegmentNW]: null,
    [Image.ThemedBarrierFlat]: null,
    [Image.ThemedBarrierPyramid]: null,
    [Image.ThemedBarrierBrick]: null,
    [Image.ThemedBarrierStone]: null,
    [Image.ThemedPortalColumns]: null,
    [Image.AppleTemplateSheet]: null,
    [Image.SnekHead]: null,
    [Image.SnekHeadDead]: null,
    [Image.SnekSegmentDark]: null,
    [Image.SnekSegmentB]: null,
    [Image.SnekSegmentD]: null,
    [Image.SnekSegmentE]: null,
    [Image.SegmentsSheet]: null,
    [Image.SnekButt]: null,
    [Image.KeySheet]: null,
    [Image.LockSheet]: null,
    [Image.PickupArrows]: null,
    [Image.UIKeysSheet]: null,
    [Image.UILocked]: null,
    [Image.UIShieldSheet]: null,
    [Image.UIFlamesheet]: null,
    [Image.Darken]: null,
    [Image.EditorSelection]: null,
    [Image.EditorSelectionBlue]: null,
    [Image.EditorSelectionRed]: null,
    [Image.MineSheet]: null,
    [Image.ExplosionSheet]: null,
    [Image.Explosion3Sheet]: null,
    [Image.PuffSheet]: null,
    [Image.FireSheet]: null,
    [Image.TileSheet16]: null,
    [Image.TileSheet48]: null,
    [Image.PickupsSheet]: null,
    [Image.WearablesSheet]: null,
    [Image.DoorLightSheet]: null,
    [Image.DoorOpenSheet]: null,
    [Image.PreyGrubSheet]: null,
    [Image.PreyMouseSheet]: null,
    [Image.PreyAntSheet]: null,
    [Image.PreyGrasshopperSheet]: null,
    [Image.Points500]: null,
    [Image.Points1000]: null,
    [Image.Points2000]: null,
    [Image.Points5000]: null,
    [Image.Points10000]: null,
    [Image.Shield]: null,
    [Image.ShieldSpawn]: null,
    [Image.PickupOutlineBlueSheet]: null,
    [Image.PickupOutlineYellowSheet]: null,
    [Image.ThreatSheet16]: null,
    [Image.ThreatSheet48]: null,
  } satisfies Record<Image, P5.Image | null>;

  constructor(props: SpriteRendererConstructorProps) {
    this.p5 = props.p5;
    this.screenShake = props.screenShake || {
      offset: new Vector(0, 0),
      timeSinceStarted: 0,
      timeSinceLastStep: 0,
      magnitude: 0,
      timeScale: 0
    };
    this.setTestImage();
  }

  private fullPath(image: Image): string {
    return `${getRelativeDir()}assets/graphics/${image}`;
  }

  private loadImage(image: Image) {
    this.p5.loadImage(this.fullPath(image), (loadedImage) => {
      this.images[image] = loadedImage;
    })
  }

  setScreenShake = (value: ScreenShakeState) => {
    this.screenShake = value;
  }

  setIsStaticCached = (value: boolean) => {
    this.isStaticCached = value;
  }

  private setTestImage = () => {
    let w = 48;
    let h = 48;
    const img = this.p5.createImage(w, h);
    // iterate through all pixels, replacing with debug color
    img.loadPixels();
    for (let x = 0; x < img.width; x += 1) {
      for (let y = 0; y < img.height; y += 1) {
        img.set(x, y, this.p5.color('pink'));
      }
    }
    img.updatePixels();
    this.images[Image.__TEST__] = img;
  }

  /**
   * Set the apple image from a template based on the level theme colors (palette).
   *
   * NOTE - must be called after `loadImages()`.
   */
  setThemedAppleImage = (palette: ExtendedPalette) => {
    const r_colorDark = Color(palette.appleStroke).darken(0.2).saturate(0.1).hex();
    const r_colorLight = Color(palette.appleStroke).lighten(0.2).desaturate(0.1).hex();
    const colors = {
      dark: this.p5.color(r_colorDark),
      light: this.p5.color(r_colorLight),
      main: this.p5.color(palette.apple),
      alt: this.p5.color(palette.appleStroke), // unused
    } satisfies ColorReplacementPalette;
    this.setThemedImageFromSprite(colors, 16, Image.ThemedAppleSheet, Image.AppleTemplateSheet, 0, true);
  }

  setThemedBorderImages = (palette: ExtendedPalette) => {
    const r_colorDark = Color(palette.barrierBorderDark).darken(0.2).saturate(0.1).hex();
    const r_colorLight = Color(palette.barrierBorderLight).lighten(0.2).desaturate(0.1).hex();
    const colors = {
      dark: this.p5.color(r_colorDark),
      light: this.p5.color(r_colorLight),
      main: this.p5.color(palette.barrierStroke),
      alt: this.p5.color(palette.barrier)
    } satisfies ColorReplacementPalette;
    this.setThemedImageFromSprite(colors, 16, Image.ThemedBarrierSkull, Image.TileSheet16, 1);
    this.setThemedImageFromSprite(colors, 16, Image.ThemedBarrierIndent, Image.TileSheet16, 3);
    this.setThemedImageFromSprite(colors, 16, Image.ThemedBarrierFlat, Image.TileSheet16, 5);
    this.setThemedImageFromSprite(colors, 16, Image.ThemedBarrierPyramid, Image.TileSheet16, 7);
    this.setThemedImageFromSprite(colors, 16, Image.ThemedBarrierBrick, Image.TileSheet16, 23);
    this.setThemedImageFromSprite(colors, 16, Image.ThemedBarrierStone, Image.TileSheet16, 25);
    this.setThemedImageFromSprite(colors, 48, Image.ThemedPortalColumns, Image.TileSheet48, 0);
  }

  setThemedDoorImage = (palette: ExtendedPalette) => {
    const r_colorDark = Color(palette.doorStroke).darken(0.25).saturate(0.1).hex();
    const r_colorLight = Color(palette.doorStroke).lighten(0.2).desaturate(0.1).hex();
    const colors = {
      dark: this.p5.color(r_colorDark),
      light: this.p5.color(r_colorLight),
      main: this.p5.color(palette.door),
      alt: this.p5.color(palette.doorStroke),
    } satisfies ColorReplacementPalette;
    this.setThemedImageFromSprite(colors, 16, Image.ThemedDoor, Image.TileSheet16, 9);
    this.setThemedImageFromSprite(colors, 16, Image.ThemedDoorAlt, Image.TileSheet16, 8);
  }

  setThemedSegmentImage = (background: string, lineColor: string) => {
    const colors = {
      dark: this.p5.color(getBorderColorVariant(lineColor, 'dark')),
      light: this.p5.color(getBorderColorVariant(lineColor, 'light')),
      main: this.p5.color(lineColor),
      alt: this.p5.color(background),
    } satisfies ColorReplacementPalette;
    this.setThemedImageFromSprite(colors, 48, Image.ThemedSegmentNE, Image.TileSheet48, 3);
    this.setThemedImageFromSprite(colors, 48, Image.ThemedSegmentSE, Image.TileSheet48, 4);
    this.setThemedImageFromSprite(colors, 48, Image.ThemedSegmentSW, Image.TileSheet48, 5);
    this.setThemedImageFromSprite(colors, 48, Image.ThemedSegmentNW, Image.TileSheet48, 6);
  }

  private setThemedImageFromSprite(colors: ColorReplacementPalette, size: 16 | 48, dest: ThemedImage, sourceSprite: Image, frame: number, matchSize = false) {
    if (!this.images[sourceSprite]) {
      throw new Error(`source image is not loaded: ${sourceSprite}`);
    }
    const loaded = this.images[sourceSprite];
    const w = matchSize ? (loaded.width || 1) : size;
    const h = matchSize ? (loaded.height || 1) : size;
    const img = this.p5.createImage(w, h);
    // copy template image pixels to new image (assumes dest img and src rect are same dims)
    img.copy(this.images[sourceSprite], size * frame, 0, w, h, 0, 0, w, h);
    // iterate through all pixels, replacing with theme colors
    img.loadPixels();
    for (let x = 0; x < img.width; x += 1) {
      for (let y = 0; y < img.height; y += 1) {
        const pixel = img.get(x, y);
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];
        const a = pixel[3];
        // transparent pixel => pass
        if (a <= 5) {
          continue;
        }
        // black pixel => pass
        if (r <= 5 && g <= 5 && b <= 5 && a >= 250) {
          continue;
        }
        // red => dark
        if (r >= 250 && g <= 5 && b <= 5) {
          img.set(x, y, colors.dark);
        }
        // green => main
        if (r <= 5 && g >= 250 && b <= 5) {
          img.set(x, y, colors.main);
        }
        // blue => light
        if (r <= 5 && g <= 5 && b >= 250) {
          img.set(x, y, colors.light);
        }
        // cyan => alt
        if (r <= 5 && g >= 250 && b >= 250) {
          img.set(x, y, colors.alt);
        }
        // else, keep same color
      }
    }
    img.updatePixels();
    this.images[dest] = img;
  }

  /**
   * Load all images / spritesheets into memory
   */
  loadImages() {
    try {
      this.loadImage(Image.ControlsKeyboardDelete);
      this.loadImage(Image.ControlsKeyboardMove);
      this.loadImage(Image.ControlsKeyboardTurn);
      this.loadImage(Image.ControlsKeyboardSprint);
      this.loadImage(Image.ControlsGamepadRewind);
      this.loadImage(Image.ControlsGamepadMove);
      this.loadImage(Image.ControlsGamepadTurn);
      this.loadImage(Image.ControlsGamepadSprint);
      this.loadImage(Image.ControlsMouseLeft);
      this.loadImage(Image.AppleTemplateSheet);
      this.loadImage(Image.SnekHead);
      this.loadImage(Image.SnekHeadDead);
      this.loadImage(Image.SnekSegmentDark);
      this.loadImage(Image.SnekSegmentB);
      this.loadImage(Image.SnekSegmentD);
      this.loadImage(Image.SnekSegmentE);
      this.loadImage(Image.SegmentsSheet);
      this.loadImage(Image.SnekButt);
      this.loadImage(Image.KeySheet);
      this.loadImage(Image.LockSheet);
      this.loadImage(Image.PickupArrows);
      this.loadImage(Image.UIKeysSheet);
      this.loadImage(Image.UIShieldSheet);
      this.loadImage(Image.UILocked);
      this.loadImage(Image.UIFlamesheet);
      this.loadImage(Image.Darken);
      this.loadImage(Image.MineSheet);
      this.loadImage(Image.ExplosionSheet);
      this.loadImage(Image.Explosion3Sheet);
      this.loadImage(Image.PuffSheet);
      this.loadImage(Image.FireSheet);
      this.loadImage(Image.TileSheet16);
      this.loadImage(Image.TileSheet48);
      this.loadImage(Image.PickupsSheet);
      this.loadImage(Image.WearablesSheet);
      this.loadImage(Image.DoorLightSheet);
      this.loadImage(Image.DoorOpenSheet);
      this.loadImage(Image.PreyGrubSheet);
      this.loadImage(Image.PreyMouseSheet);
      this.loadImage(Image.PreyAntSheet);
      this.loadImage(Image.PreyGrasshopperSheet);
      this.loadImage(Image.Points500);
      this.loadImage(Image.Points1000);
      this.loadImage(Image.Points2000);
      this.loadImage(Image.Points5000);
      this.loadImage(Image.Points10000);
      this.loadImage(Image.Shield);
      this.loadImage(Image.ShieldSpawn);
      this.loadImage(Image.PickupOutlineBlueSheet);
      this.loadImage(Image.PickupOutlineYellowSheet);
      this.loadImage(Image.ThreatSheet16);
      this.loadImage(Image.ThreatSheet48);
    } catch (err) {
      console.error(err)
    }
  }

  loadEditorImages() {
    try {
      this.loadImage(Image.EditorSelection);
      this.loadImage(Image.EditorSelectionBlue);
      this.loadImage(Image.EditorSelectionRed);
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Imperatively draw a 3x3 image (normally 48x48 px)
   */
  drawImage3x3 = (image: Image, x: number, y: number, rotation: number = 0, alpha = 1, screenshakeMul = 1, frame = 0, frames = 1) => {
    this.drawImage3x3Impl(this.p5, image, x, y, rotation, alpha, screenshakeMul, frame, frames);
  }

  /**
   * Imperatively draw a 3x3 image (normally 48x48 px) providing a P5 or Graphics instant on which to draw
   */
  drawImage3x3Custom = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, rotation: number = 0, alpha = 1, screenshakeMul = 0, frame = 0, frames = 1) => {
    this.drawImage3x3Impl(gfx, image, x, y, rotation, alpha, screenshakeMul, frame, frames);
  }

  /**
   * Draw a 3x3 image if not cached.
   */
  drawImage3x3Static = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, rotation: number = 0, alpha = 1, screenshakeMul = 0, frame = 0, frames = 1) => {
    if (this.isStaticCached) return;
    this.drawImage3x3Impl(gfx, image, x, y, rotation, alpha, screenshakeMul, frame, frames);
  }

  /**
   * Draw an animation from a 3x3 (48x48) spritesheet
   */
  drawSpritesheetAnim3x3 = (gfx: P5 | P5.Graphics, sprite: SpritesheetImage | SpritesheetRange, x: number, y: number, elapsed = 0) => {
    if (!ANIMATIONS[sprite]) {
      throw new Error(`no animation data found for image "${sprite}"`);
    }
    const { frames, timePerFrame, durations } = ANIMATIONS[sprite];
    if (!timePerFrame) throw new Error(`timePerFrame cannot be zero. val=${timePerFrame},img=${sprite}`);
    const src = isValidSpritesheetRange(sprite) ? (ANIMATIONS[sprite].src || Image.__TEST__) : sprite;
    const offset = isValidSpritesheetRange(sprite) ? ANIMATIONS[sprite].offset || 0 : 0;
    const frame = getCurrentFrame(frames, timePerFrame, durations, elapsed) + offset;
    const spriteFrames = ANIMATIONS[src]?.frames || frames;
    this.drawImage3x3Impl(gfx, src, x, y, 0, 1, 0, frame, spriteFrames);
  }

  drawSpritesheetAnim3x3Static = (gfx: P5 | P5.Graphics, image: SpritesheetImage | SpritesheetRange, x: number, y: number, elapsed = 0) => {
    if (this.isStaticCached) return;
    this.drawSpritesheetAnim3x3(gfx, image, x, y, elapsed);
  }

  /**
   * Draw a sprite from a spritesheet
   */
  drawSprite3x3 = (gfx: P5 | P5.Graphics, image: SpritesheetImage, x: number, y: number, frame = 0, rotation = 0, alpha = 1) => {
    if (!ANIMATIONS[image]) {
      throw new Error(`no animation data found for image "${image}"`);
    }
    const { frames } = ANIMATIONS[image];
    this.drawImage3x3Impl(gfx, image, x, y, rotation, alpha, 0.5, frame, frames);
  }

  drawSprite3x3Static = (gfx: P5 | P5.Graphics, image: SpritesheetImage, x: number, y: number, frame = 0) => {
    if (this.isStaticCached) return;
    this.drawSprite3x3(gfx, image, x, y, frame);
  }

  private drawImage3x3Impl = (
    gfx: P5 | P5.Graphics,
    image: Image,
    x: number,
    y: number,
    rotation: number = 0,
    alpha = 1,
    screenshakeMul = 1,
    frame = 0,
    frames = 1,
  ) => {
    if (!frames) throw new Error(`frames cannot be zero. val=${frames},img=${image}`);
    const loaded = this.images[image];
    if (!loaded) {
      return;
    }
    const widthX = Math.floor(BLOCK_SIZE_X);
    const widthY = Math.floor(BLOCK_SIZE_Y);
    const offset = -STROKE_SIZE * 0.5;
    const posx = Math.floor(x * BLOCK_SIZE_X + this.screenShake.offset.x * screenshakeMul - BLOCK_SIZE_X * IMG_SCALE) + MAP_OFFSET + IMG_X_OFFSET;
    const posy = Math.floor(y * BLOCK_SIZE_Y + this.screenShake.offset.y * screenshakeMul - BLOCK_SIZE_Y * IMG_SCALE) + MAP_OFFSET;

    gfx.push();
    gfx.noSmooth();
    gfx.translate(
      posx,
      posy,
    );
    if (rotation) {
      gfx.translate(
        (widthX * 1.5 + offset) * IMG_SCALE,
        (widthY * 1.5 + offset) * IMG_SCALE,
      );
      gfx.rotate(rotation);
      gfx.translate(
        (-widthX * 1.5 - offset) * IMG_SCALE,
        (-widthY * 1.5 - offset) * IMG_SCALE,
      );
    }
    if (alpha !== 1) {
      gfx.tint(255, 255, 255, lerp(0, 255, alpha));
    }
    const frameWidth = loaded.width / frames;
    gfx.image(
      loaded,
      // destination (x, y, w, h)
      0,
      0,
      (widthX * 3 - STROKE_SIZE) * IMG_SCALE,
      (widthY * 3 - STROKE_SIZE) * IMG_SCALE,
      // source (x, y, w, h)
      frame * frameWidth,
      0,
      frameWidth,
      loaded.height,
      this.p5.COVER,
      this.p5.LEFT,
      this.p5.TOP
    );
    if (alpha !== 1) {
      gfx.tint(255, 255, 255, 255);
    }
    gfx.pop();
  }

  /**
   * Draw an animation from a 1x1 (16x16) spritesheet
   */
  drawSpritesheetAnim1x1 = (gfx: P5 | P5.Graphics, sprite: SpritesheetImage | SpritesheetRange, x: number, y: number, elapsed = 0) => {
    if (!ANIMATIONS[sprite]) {
      throw new Error(`no animation data found for image "${sprite}"`);
    }
    const { frames, timePerFrame, durations } = ANIMATIONS[sprite];
    if (!timePerFrame) throw new Error(`timePerFrame cannot be zero. val=${timePerFrame},img=${sprite}`);
    const src = isValidSpritesheetRange(sprite) ? (ANIMATIONS[sprite].src || Image.__TEST__) : sprite;
    const offset = isValidSpritesheetRange(sprite) ? (ANIMATIONS[sprite].offset || 0) : 0;
    const frame = getCurrentFrame(frames, timePerFrame, durations, elapsed) + offset;
    const spriteFrames = ANIMATIONS[src]?.frames || frames;
    this.drawImage1x1(gfx, src, x, y, 0, 1, 0, frame, spriteFrames);
  }

  public drawSprite1x1 = (gfx: P5 | P5.Graphics, image: SpritesheetImage, x: number, y: number, frame = 0, rotation = 0, alpha = 1) => {
    if (!ANIMATIONS[image]) {
      throw new Error(`no animation data found for image "${image}"`);
    }
    const { frames } = ANIMATIONS[image];
    this.drawImage1x1(gfx, image, x, y, rotation, alpha, 0.5, frame, frames);
  }

  public drawSprite1x1Static = (gfx: P5 | P5.Graphics, image: SpritesheetImage, x: number, y: number, frame = 0) => {
    if (this.isStaticCached) return;
    this.drawSprite1x1(gfx, image, x, y, frame);
  }

  public drawImage1x1Static = (...args: Parameters<SpriteRenderer['drawImage1x1']>) => {
    if (this.isStaticCached) return;
    this.drawImage1x1(...args);
  }

  public drawImage1x1 = (
    gfx: P5 | P5.Graphics,
    image: Image,
    x: number,
    y: number,
    rotation: number = 0,
    alpha = 1,
    screenshakeMul = 1,
    frame = 0,
    frames = 1,
  ) => {
    if (!frames) throw new Error(`frames cannot be zero. val=${frames},img=${image}`);
    const loaded = this.images[image];
    if (!loaded) {
      return;
    }
    const widthX = Math.floor(BLOCK_SIZE_X) + STROKE_SIZE;
    const widthY = Math.floor(BLOCK_SIZE_Y) + STROKE_SIZE;
    const offset = -STROKE_SIZE * 0.5;
    const posx = Math.floor(x * BLOCK_SIZE_X + this.screenShake.offset.x * screenshakeMul) + offset + MAP_OFFSET + IMG_X_OFFSET;
    const posy = Math.floor(y * BLOCK_SIZE_Y + this.screenShake.offset.y * screenshakeMul) + offset + MAP_OFFSET;

    gfx.push();
    gfx.noSmooth();
    gfx.translate(
      posx,
      posy,
    );
    if (rotation) {
      gfx.translate(
        (widthX * 0.5 + offset) * IMG_SCALE,
        (widthY * 0.5 + offset) * IMG_SCALE,
      );
      gfx.rotate(rotation);
      gfx.translate(
        (-widthX * 0.5 - offset) * IMG_SCALE,
        (-widthY * 0.5 - offset) * IMG_SCALE,
      );
    }
    if (alpha !== 1) {
      gfx.tint(255, 255, 255, lerp(0, 255, alpha));
    }
    const frameWidth = loaded.width / frames;
    gfx.image(
      loaded,
      // destination (x, y, w, h)
      0,
      0,
      (widthX - STROKE_SIZE) * IMG_SCALE,
      (widthY - STROKE_SIZE) * IMG_SCALE,
      // source (x, y, w, h)
      frame * frameWidth,
      0,
      frameWidth,
      loaded.height,
      this.p5.COVER,
      this.p5.LEFT,
      this.p5.TOP
    );
    if (alpha !== 1) {
      gfx.tint(255, 255, 255, 255);
    }
    gfx.pop();
  }

  drawImage = (image: Image, x: number, y: number, gfx: P5 | P5.Graphics = this.p5, alpha = 1, offset = MAP_OFFSET, rotation = 0) => {
    this.drawImageImpl(gfx, image, x, y, alpha, offset, rotation);
  }

  drawImageStatic = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, alpha = 1, offset = MAP_OFFSET) => {
    if (this.isStaticCached) return;
    this.drawImageImpl(gfx, image, x, y, alpha, offset, 0);
  }

  getImageWidth = (image: Image): number => {
    const loaded = this.images[image];
    if (!loaded) return 0;
    return loaded.width * 2;
  }

  getImageHeight = (image: Image): number => {
    const loaded = this.images[image];
    if (!loaded) return 0;
    return loaded.height * 2;
  }

  private drawImageImpl = (
    gfx: P5 | P5.Graphics,
    image: Image,
    x: number,
    y: number,
    alpha = 1,
    offset = MAP_OFFSET,
    rotation = 0,
    frames = 1,
    timePerFrame = 1000,
    elapsed = 0,
  ) => {
    if (!frames) throw new Error(`frames cannot be zero. val=${frames}`);
    if (!timePerFrame) throw new Error(`timePerFrame cannot be zero. val=${timePerFrame}`);
    const loaded = this.images[image];
    if (!loaded) {
      return;
    }
    gfx.push();
    gfx.noSmooth();
    gfx.translate(
      Math.round(x + offset),
      Math.round(y + offset),
    );
    if (rotation) {
      // translate 1 instead of 0.5 because we are doubling all image sizes
      gfx.translate(
        loaded.width,
        loaded.height,
      );
      gfx.rotate(rotation);
      gfx.translate(
        -loaded.width,
        -loaded.height,
      );
    }
    if (alpha !== 1) {
      gfx.tint(255, 255, 255, lerp(0, 255, alpha));
    }
    const frame = Math.floor(elapsed / timePerFrame) % frames;
    const frameWidth = loaded.width / frames;
    gfx.image(
      loaded,
      // destination (x, y, w, h)
      0,
      0,
      Math.round(2 * loaded.width),
      Math.round(2 * loaded.height),
      // source (x, y, w, h)
      frame * frameWidth,
      0,
      frameWidth,
      loaded.height,
      this.p5.COVER,
      this.p5.LEFT,
      this.p5.TOP
    );
    if (alpha !== 1) {
      gfx.tint(255, 255, 255, 255);
    }
    gfx.pop();
  }

  public drawSpritesheetAnim = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, frames: number, timePerFrame: number, elapsed: number) => {
    const loaded = this.images[image];
    if (!loaded) {
      return;
    }
    const frame = Math.floor(elapsed / timePerFrame) % frames;
    const frameWidth = loaded.width / frames;
    gfx.push();
    gfx.noSmooth();
    gfx.image(
      loaded,
      // destination (x, y, w, h)
      Math.round(x),
      Math.round(y),
      Math.round(frameWidth),
      Math.round(loaded.height),
      // source (x, y, w, h)
      frame * frameWidth,
      0,
      frameWidth,
      loaded.height,
      this.p5.COVER,
      this.p5.LEFT,
      this.p5.TOP
    );
    gfx.pop();
  }
}
