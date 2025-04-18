import P5, { Vector } from "p5";

import { ScreenShakeState, Image } from "../types";
import { BLOCK_SIZE, MAP_OFFSET, STROKE_SIZE } from "../constants";
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
    [Image.ControlsKeyboardSprint]: null,
    [Image.ControlsMouseLeft]: null,
    [Image.SnekHead]: null,
    [Image.SnekHeadDead]: null,
    [Image.SnekButt]: null,
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
    [Image.Darken]: null,
    [Image.EditorSelection]: null,
    [Image.EditorSelectionBlue]: null,
    [Image.EditorSelectionRed]: null,
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

  loadImages() {
    try {
      this.loadImage(Image.ControlsKeyboardDelete);
      this.loadImage(Image.ControlsKeyboardMove);
      this.loadImage(Image.ControlsKeyboardSprint);
      this.loadImage(Image.ControlsMouseLeft);
      this.loadImage(Image.SnekHead);
      this.loadImage(Image.SnekHeadDead);
      this.loadImage(Image.SnekButt);
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
      this.loadImage(Image.Darken);
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

  drawImage3x3 = (image: Image, x: number, y: number, rotation: number = 0, alpha = 1, screenshakeMul = 1) => {
    this.drawImage3x3Impl(this.p5, image, x, y, rotation, alpha, screenshakeMul);
  }

  drawImage3x3Custom = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, rotation: number = 0, alpha = 1, screenshakeMul = 0) => {
    this.drawImage3x3Impl(gfx, image, x, y, rotation, alpha, screenshakeMul);
  }

  drawImage3x3Static = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, rotation: number = 0, alpha = 1, screenshakeMul = 0) => {
    if (this.isStaticCached) return;
    this.drawImage3x3Impl(gfx, image, x, y, rotation, alpha, screenshakeMul);
  }

  private drawImage3x3Impl = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, rotation: number = 0, alpha = 1, screenshakeMul = 1) => {
    const loaded = this.images[image];
    if (!loaded) return;
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
    gfx.translate(
      (widthX * 1.5 + offset) * IMAGE_SCALE,
      (widthY * 1.5 + offset) * IMAGE_SCALE,
    );
    gfx.rotate(rotation);
    gfx.translate(
      (-widthX * 1.5 - offset) * IMAGE_SCALE,
      (-widthY * 1.5 - offset) * IMAGE_SCALE,
    );
    gfx.tint(255, 255, 255, lerp(0, 255, alpha));
    gfx.image(
      loaded,
      0,
      0,
      (widthX * 3 - STROKE_SIZE) * IMAGE_SCALE,
      (widthY * 3 - STROKE_SIZE) * IMAGE_SCALE,
      0,
      0,
      loaded.width,
      loaded.height,
      this.p5.COVER,
      this.p5.LEFT,
      this.p5.TOP
    );
    gfx.tint(255, 255, 255, 255);
    gfx.pop();
  }

  drawImage = (image: Image, x: number, y: number, gfx: P5 | P5.Graphics = this.p5, alpha = 1, offset = MAP_OFFSET) => {
    this.drawImageImpl(gfx, image, x, y, alpha, offset);
  }

  drawImageStatic = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, alpha = 1, offset = MAP_OFFSET) => {
    if (this.isStaticCached) return;
    this.drawImageImpl(gfx, image, x, y, alpha, offset);
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

  private drawImageImpl = (gfx: P5 | P5.Graphics, image: Image, x: number, y: number, alpha = 1, offset = MAP_OFFSET) => {
    const loaded = this.images[image];
    if (!loaded) return;
    gfx.push();
    gfx.tint(255, 255, 255, lerp(0, 255, alpha));
    gfx.image(
      loaded,
      Math.round(x + offset),
      Math.round(y + offset),
      Math.round(2 * loaded.width),
      Math.round(2 * loaded.height),
      0,
      0,
      loaded.width,
      loaded.height,
      this.p5.COVER,
      this.p5.LEFT,
      this.p5.TOP
    );
    gfx.pop();
  }
}
