import P5, { Vector } from "p5";
import Color from "color";

import { ScreenShakeState, Image, Palette, ExtendedPalette, AnimationData, SpritesheetImage, ThemedImage, ColorReplacementPalette } from "../types";
import { ANIMATIONS, BLOCK_SIZE, MAP_OFFSET, STROKE_SIZE } from "../constants";
import { getRelativeDir, lerp } from "../utils";

const IMAGE_SCALE = 1.01;

interface SpriteRendererConstructorProps {
  p5: P5
  screenShake?: ScreenShakeState
}

export class SpriteRenderer {
  private p5: P5 = null;
  private screenShake: ScreenShakeState = null;

  private isStaticCached = false;

  private images: Record<Image, P5.Image | null> = {
    [Image.ControlsKeyboardDelete]: null,
    [Image.ControlsKeyboardMove]: null,
    [Image.ControlsKeyboardTurn]: null,
    [Image.ControlsKeyboardSprint]: null,
    [Image.ControlsGamepadRewind]: null,
    [Image.ControlsGamepadMove]: null,
    [Image.ControlsGamepadTurn]: null,
    [Image.ControlsGamepadSprint]: null,
    [Image.ControlsMouseLeft]: null,
    [Image.ThemedApple]: null,
    [Image.ThemedBarrierSkull]: null,
    [Image.ThemedBarrierIndent]: null,
    [Image.ThemedDoor]: null,
    [Image.AppleTemplate]: null,
    [Image.SnekHead]: null,
    [Image.SnekHeadDead]: null,
    [Image.SnekSegmentDark]: null,
    [Image.SnekSegmentB]: null,
    [Image.SnekSegmentD]: null,
    [Image.SnekSegmentE]: null,
    [Image.SnekButt]: null,
    [Image.SnekDoorLightA]: null,
    [Image.SnekDoorLightB]: null,
    [Image.SnekDoorLightC]: null,
    [Image.SnekDoorLightD]: null,
    [Image.SnekDoorLightE]: null,
    [Image.KeyGrey]: null,
    [Image.KeyYellow]: null,
    [Image.KeyRed]: null,
    [Image.KeyBlue]: null,
    [Image.LockGrey]: null,
    [Image.LockYellow]: null,
    [Image.LockRed]: null,
    [Image.LockBlue]: null,
    [Image.PickupArrows]: null,
    [Image.UIKeyGrey]: null,
    [Image.UIKeyYellow]: null,
    [Image.UIKeyRed]: null,
    [Image.UIKeyBlue]: null,
    [Image.UILocked]: null,
    [Image.UIFlamesheet]: null,
    [Image.Darken]: null,
    [Image.EditorSelection]: null,
    [Image.EditorSelectionBlue]: null,
    [Image.EditorSelectionRed]: null,
    [Image.MineSheet]: null,
    [Image.ExplosionSheet]: null,
    [Image.FireSheet]: null,
    [Image.TileSheet]: null,
  }

  constructor(props: SpriteRendererConstructorProps) {
    this.p5 = props.p5;
    this.screenShake = props.screenShake || {
      offset: new Vector(0, 0),
      timeSinceStarted: 0,
      timeSinceLastStep: 0,
      magnitude: 0,
      timeScale: 0
    };
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

  /**
   * Set the apple image from a template based on the level theme colors (palette).
   *
   * NOTE - must be called after `loadImages()`.
   */
  setThemedAppleImage = (palette: ExtendedPalette) => {
    const r_colorDark = Color(palette.appleStroke).darken(0.2).saturate(0.1).hex();
    const r_colorLight = Color(palette.appleStroke).lighten(0.2).desaturate(0.1).hex();
    const r_colorMain = palette.apple;
    const colors = {
      dark: this.p5.color(r_colorDark),
      light: this.p5.color(r_colorLight),
      main: this.p5.color(r_colorMain),
    } satisfies ColorReplacementPalette;
    this.setThemedImageFromSprite(colors, Image.ThemedApple, Image.AppleTemplate, 0);
  }

  setThemedBorderImages = (palette: ExtendedPalette) => {
    const r_colorDark = Color(palette.barrierBorderDark).darken(0.2).saturate(0.1).hex();
    const r_colorLight = Color(palette.barrierBorderLight).lighten(0.2).desaturate(0.1).hex();
    const r_colorMain = palette.barrierStroke;
    const colors = {
      dark: this.p5.color(r_colorDark),
      light: this.p5.color(r_colorLight),
      main: this.p5.color(r_colorMain),
    } satisfies ColorReplacementPalette;
    this.setThemedImageFromSprite(colors, Image.ThemedBarrierSkull, Image.TileSheet, 1);
    this.setThemedImageFromSprite(colors, Image.ThemedBarrierIndent, Image.TileSheet, 3);
  }

  setThemedDoorImage = (palette: ExtendedPalette) => {
    const r_colorDark = Color(palette.doorStroke).darken(0.2).saturate(0.1).hex();
    const r_colorLight = Color(palette.doorStroke).lighten(0.2).desaturate(0.1).hex();
    const r_colorMain = palette.door;
    const colors = {
      dark: this.p5.color(r_colorDark),
      light: this.p5.color(r_colorLight),
      main: this.p5.color(r_colorMain),
    } satisfies ColorReplacementPalette;
    this.setThemedImageFromSprite(colors, Image.ThemedDoor, Image.TileSheet, 9);
  }

  private setThemedImageFromSprite(colors: ColorReplacementPalette, dest: ThemedImage, sourceSprite: Image, frame: number) {
    if (!this.images[sourceSprite]) {
      throw new Error(`source image is not loaded: ${sourceSprite}`);
    }
    const img = this.p5.createImage(48, 48);
    // copy template image pixels to new image (assumes 48x48 dest img dims, as well as 48x48 src rect)
    img.copy(this.images[sourceSprite], 48 * frame, 0, 48, 48, 0, 0, 48, 48);
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
        if (g >= 250 && r <= 5 && b <= 5) {
          img.set(x, y, colors.main);
        }
        // blue => light
        if (b >= 250 && r <= 5 && g <= 5) {
          img.set(x, y, colors.light);
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
      this.loadImage(Image.AppleTemplate);
      this.loadImage(Image.SnekHead);
      this.loadImage(Image.SnekHeadDead);
      this.loadImage(Image.SnekSegmentDark);
      this.loadImage(Image.SnekSegmentB);
      this.loadImage(Image.SnekSegmentD);
      this.loadImage(Image.SnekSegmentE);
      this.loadImage(Image.SnekButt);
      this.loadImage(Image.SnekDoorLightA);
      this.loadImage(Image.SnekDoorLightB);
      this.loadImage(Image.SnekDoorLightC);
      this.loadImage(Image.SnekDoorLightD);
      this.loadImage(Image.SnekDoorLightE);
      this.loadImage(Image.KeyGrey);
      this.loadImage(Image.KeyYellow);
      this.loadImage(Image.KeyRed);
      this.loadImage(Image.KeyBlue);
      this.loadImage(Image.LockGrey);
      this.loadImage(Image.LockYellow);
      this.loadImage(Image.LockRed);
      this.loadImage(Image.LockBlue);
      this.loadImage(Image.PickupArrows);
      this.loadImage(Image.UIKeyGrey);
      this.loadImage(Image.UIKeyYellow);
      this.loadImage(Image.UIKeyRed);
      this.loadImage(Image.UIKeyBlue);
      this.loadImage(Image.UILocked);
      this.loadImage(Image.UIFlamesheet);
      this.loadImage(Image.Darken);
      this.loadImage(Image.MineSheet);
      this.loadImage(Image.ExplosionSheet);
      this.loadImage(Image.FireSheet);
      this.loadImage(Image.TileSheet);
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
  drawImage3x3 = (image: Image, x: number, y: number, rotation: number = 0, alpha = 1, screenshakeMul = 1) => {
    this.drawImage3x3Impl(this.p5, image, x, y, rotation, alpha, screenshakeMul);
  }

  /**
   * Imperatively draw a 3x3 image (normally 48x48 px) providing a P5 or Graphics instant on which to draw
   */
  drawImage3x3Custom = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, rotation: number = 0, alpha = 1, screenshakeMul = 0) => {
    this.drawImage3x3Impl(gfx, image, x, y, rotation, alpha, screenshakeMul);
  }

  /**
   * Draw a 3x3 image if not cached.
   */
  drawImage3x3Static = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, rotation: number = 0, alpha = 1, screenshakeMul = 0) => {
    if (this.isStaticCached) return;
    this.drawImage3x3Impl(gfx, image, x, y, rotation, alpha, screenshakeMul);
  }

  /**
   * Draw an animation from a 3x3 (48x48) spritesheet
   */
  drawSpritesheetAnim3x3 = (gfx: P5 | P5.Graphics, image: SpritesheetImage, x: number, y: number, elapsed = 0) => {
    if (!ANIMATIONS[image]) {
      throw new Error(`no animation data found for image "${image}"`);
    }
    const { frames, timePerFrame } = ANIMATIONS[image];
    this.drawImage3x3Impl(gfx, image, x, y, 0, 1, 0, frames, timePerFrame, elapsed);
  }

  drawSpritesheetAnim3x3Static = (gfx: P5 | P5.Graphics, image: SpritesheetImage, x: number, y: number, elapsed = 0) => {
    if (this.isStaticCached) return;
    this.drawSpritesheetAnim3x3(gfx, image, x, y, elapsed);
  }

  /**
   * Draw a sprite from a spritesheet
   */
  drawSprite3x3 = (gfx: P5 | P5.Graphics, image: SpritesheetImage, x: number, y: number, frame = 0) => {
    if (!ANIMATIONS[image]) {
      throw new Error(`no animation data found for image "${image}"`);
    }
    const { frames, timePerFrame } = ANIMATIONS[image];
    this.drawImage3x3Impl(gfx, image, x, y, 0, 1, 0, frames, timePerFrame, timePerFrame * frame);
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
    frames = 1,
    timePerFrame = 1000,
    elapsed = 0,
  ) => {
    if (!frames) throw new Error(`frames cannot be zero. val=${frames},img=${image}`);
    if (!timePerFrame) throw new Error(`timePerFrame cannot be zero. val=${timePerFrame},img=${image}`);
    const loaded = this.images[image];
    if (!loaded) {
      return;
    }
    const widthX = Math.floor(BLOCK_SIZE.x);
    const widthY = Math.floor(BLOCK_SIZE.y);
    const position = {
      x: Math.floor(x * BLOCK_SIZE.x + this.screenShake.offset.x * screenshakeMul - BLOCK_SIZE.x * IMAGE_SCALE) + MAP_OFFSET,
      y: Math.floor(y * BLOCK_SIZE.y + this.screenShake.offset.y * screenshakeMul - BLOCK_SIZE.y * IMAGE_SCALE) + MAP_OFFSET,
    }

    const offset = -STROKE_SIZE * 0.5;
    gfx.push();
    gfx.translate(
      position.x,
      position.y,
    );
    if (rotation) {
      gfx.translate(
        (widthX * 1.5 + offset) * IMAGE_SCALE,
        (widthY * 1.5 + offset) * IMAGE_SCALE,
      );
      gfx.rotate(rotation);
      gfx.translate(
        (-widthX * 1.5 - offset) * IMAGE_SCALE,
        (-widthY * 1.5 - offset) * IMAGE_SCALE,
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
      (widthX * 3 - STROKE_SIZE) * IMAGE_SCALE,
      (widthY * 3 - STROKE_SIZE) * IMAGE_SCALE,
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
    // this is why you should use a dedicated game engine, to not have to deal with sub-pixel adjustments
    // const adjustment = IMAGE_SCALE - (IMAGE_SCALE - 1) * 0.5;
    const adjustment = 1;
    gfx.push();
    gfx.translate(
      Math.round(x + offset),
      Math.round(y + offset),
    );
    if (rotation) {
      // translate 1 instead of 0.5 because we are doubling all image sizes
      gfx.translate(
        (loaded.width) * adjustment,
        (loaded.height) * adjustment,
      );
      gfx.rotate(rotation);
      gfx.translate(
        (-loaded.width) * adjustment,
        (-loaded.height) * adjustment,
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
  }
}
