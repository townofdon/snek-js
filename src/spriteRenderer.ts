import P5 from "p5";
import { GameState, Replay, ScreenShakeState, Image } from "./types";
import { BLOCK_SIZE, STROKE_SIZE } from "./constants";

const IMAGE_SCALE = 1.01;

interface RendererConstructorProps {
  p5: P5
  replay: Replay
  gameState: GameState
  screenShake: ScreenShakeState
}

export class SpriteRenderer {
  private props: RendererConstructorProps = {
    p5: null,
    replay: null,
    gameState: null,
    screenShake: null,
  }

  private images: Record<Image, P5.Image | null> = {
    [Image.SnekHead]: null,
    [Image.SnekHeadDead]: null,
    [Image.SnekButt]: null,
  }

  constructor({ p5, replay, gameState, screenShake }: RendererConstructorProps) {
    this.props.p5 = p5;
    this.props.replay = replay;
    this.props.gameState = gameState;
    this.props.screenShake = screenShake;
  }

  private fullPath(image: Image): string {
    const relativeDir = process.env.NODE_ENV === 'production' ? '' : window.location.pathname;
    return `${relativeDir}assets/graphics/${image}`;
  }

  private loadImage(image: Image) {
    const { p5 } = this.props;
    p5.loadImage(this.fullPath(image), (loadedImage) => {
      this.images[image] = loadedImage;
    })
  }

  loadImages() {
    this.loadImage(Image.SnekHead);
    this.loadImage(Image.SnekHeadDead);
    this.loadImage(Image.SnekButt);
  }

  drawImage(image: Image, x: number, y: number, rotation: number = 0) {
    const { p5, screenShake } = this.props;
    const loaded = this.images[image];
    if (!loaded) return;
    const widthX = BLOCK_SIZE.x;
    const widthY = BLOCK_SIZE.y;
    const position = {
      x: x * BLOCK_SIZE.x + screenShake.offset.x - BLOCK_SIZE.x * IMAGE_SCALE,
      y: y * BLOCK_SIZE.y + screenShake.offset.y - BLOCK_SIZE.y * IMAGE_SCALE,
    }

    const offset = -STROKE_SIZE * 0.5;
    p5.push();
    p5.translate(
      position.x,
      position.y,
    );
    p5.translate(
      (widthX * 1.5 + offset) * IMAGE_SCALE,
      (widthY * 1.5 + offset) * IMAGE_SCALE,
    );
    p5.rotate(rotation);
    p5.translate(
      (-widthX * 1.5 - offset) * IMAGE_SCALE,
      (-widthY * 1.5 - offset) * IMAGE_SCALE,
    );
    p5.image(
      loaded,
      0,
      0,
      (widthX * 3 - STROKE_SIZE) * IMAGE_SCALE,
      (widthY * 3 - STROKE_SIZE) * IMAGE_SCALE,
      0,
      0,
      loaded.width,
      loaded.height,
      p5.COVER,
      p5.LEFT,
      p5.TOP
    );
    p5.pop();
  }
}
