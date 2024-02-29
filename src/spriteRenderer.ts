import P5 from "p5";
import { GameState, Replay, ScreenShakeState, Image } from "./types";
import { BLOCK_SIZE, STROKE_SIZE } from "./constants";

const IMAGE_SCALE = 1.01;

interface SpriteRendererConstructorProps {
  p5: P5
  staticGraphics: P5.Graphics
  screenShake: ScreenShakeState
}

export class SpriteRenderer {
  private p5: P5 = null;
  private staticGraphics: P5.Graphics = null;
  private screenShake: ScreenShakeState = null;

  private isStaticCached = false;

  private images: Record<Image, P5.Image | null> = {
    [Image.ControlsKeyboardDelete]: null,
    [Image.ControlsKeyboardMove]: null,
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
    [Image.UIKeyGrey]: null,
    [Image.UIKeyYellow]: null,
    [Image.UIKeyRed]: null,
    [Image.UIKeyBlue]: null,
  }

  constructor(props: SpriteRendererConstructorProps) {
    this.p5 = props.p5;
    this.staticGraphics = props.staticGraphics;
    this.screenShake = props.screenShake;
  }

  private fullPath(image: Image): string {
    const relativeDir = process.env.NODE_ENV === 'production' ? '' : window.location.pathname;
    return `${relativeDir}assets/graphics/${image}`;
  }

  private loadImage(image: Image) {
    this.p5.loadImage(this.fullPath(image), (loadedImage) => {
      this.images[image] = loadedImage;
    })
  }

  setIsStaticCached = (value: boolean) => {
    this.isStaticCached = value;
  }

  loadImages() {
    try {
      this.loadImage(Image.ControlsKeyboardDelete);
      this.loadImage(Image.ControlsKeyboardMove);
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
      this.loadImage(Image.UIKeyGrey);
      this.loadImage(Image.UIKeyYellow);
      this.loadImage(Image.UIKeyRed);
      this.loadImage(Image.UIKeyBlue);
    } catch (err) {
      console.error(err)
    }
  }

  drawImage3x3 = (image: Image, x: number, y: number, rotation: number = 0) => {
    this.drawImage3x3Impl(this.p5, image, x, y, rotation);
  }

  drawImage3x3Static = (image: Image, x: number, y: number, rotation: number = 0) => {
    if (this.isStaticCached) return;
    this.drawImage3x3Impl(this.staticGraphics, image, x, y, rotation);
  }

  private drawImage3x3Impl = (graphics: P5 | P5.Graphics, image: Image, x: number, y: number, rotation: number = 0) => {
    const loaded = this.images[image];
    if (!loaded) return;
    const widthX = BLOCK_SIZE.x;
    const widthY = BLOCK_SIZE.y;
    const position = {
      x: x * BLOCK_SIZE.x + this.screenShake.offset.x - BLOCK_SIZE.x * IMAGE_SCALE,
      y: y * BLOCK_SIZE.y + this.screenShake.offset.y - BLOCK_SIZE.y * IMAGE_SCALE,
    }

    const offset = -STROKE_SIZE * 0.5;
    graphics.push();
    graphics.translate(
      position.x,
      position.y,
    );
    graphics.translate(
      (widthX * 1.5 + offset) * IMAGE_SCALE,
      (widthY * 1.5 + offset) * IMAGE_SCALE,
    );
    graphics.rotate(rotation);
    graphics.translate(
      (-widthX * 1.5 - offset) * IMAGE_SCALE,
      (-widthY * 1.5 - offset) * IMAGE_SCALE,
    );
    graphics.image(
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
    graphics.pop();
  }

  drawImage = (image: Image, x: number, y: number) => {
    this.drawImageImpl(this.p5, image, x, y);
  }

  drawImageStatic = (image: Image, x: number, y: number) => {
    if (this.isStaticCached) return;
    this.drawImageImpl(this.staticGraphics, image, x, y);
  }

  private drawImageImpl = (graphics: P5 | P5.Graphics, image: Image, x: number, y: number) => {
    const loaded = this.images[image];
    if (!loaded) return;
    graphics.image(
      loaded,
      x,
      y,
      loaded.width,
      loaded.height,
      0,
      0,
      loaded.width,
      loaded.height,
      this.p5.COVER,
      this.p5.LEFT,
      this.p5.TOP
    );
  }
}
