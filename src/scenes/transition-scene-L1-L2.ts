import P5 from "p5";

import { IEnumerator, Scene, SceneCachedCallbacks, SceneCallbacks } from '../types';
import { Coroutines } from "../coroutines";
import { DIMENSIONS } from "../constants";
import { Fonts } from "../fonts";

interface TransitionSceneProps {
  p5: P5
  cachedCallbacks: SceneCachedCallbacks
  callbacks: SceneCallbacks
  coroutines: Coroutines
  fonts: Fonts
}

export class TransitionSceneL1L2 implements Scene {
  private props: TransitionSceneProps = {
    p5: null,
    cachedCallbacks: {
      draw: () => { },
      keyPressed: () => { },
    },
    callbacks: {
      onSceneEnded: () => { }
    },
    coroutines: null,
    fonts: null,
  };

  private state = {
    isTimeElapsed: false,
    isCleaningUp: false,
  }

  constructor(p5: P5, fonts: Fonts, callbacks: SceneCallbacks = {}) {
    this.props.p5 = p5;
    this.props.fonts = fonts;
    this.props.callbacks = callbacks;
    this.props.cachedCallbacks.draw = p5.draw;
    this.props.cachedCallbacks.keyPressed = p5.keyPressed;
    this.props.coroutines = new Coroutines(p5);
    p5.draw = this.draw;
    p5.keyPressed = this.keyPressed;
    this.startCoroutine(this.action());
  }

  *action() {
    const { coroutines, p5, fonts } = this.props;
    this.state.isTimeElapsed = true;

    const flashTime = 400;
    yield* coroutines.waitForTime(flashTime);
    for (let i = 0; i < 3; i++) {
      yield* coroutines.waitForTime(flashTime, () => {
        p5.fill('#fff');
        p5.noStroke();
        p5.textFont(fonts.variants.miniMood);
        p5.textSize(16);
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text('GET READY!', ...this.getPosition(0.5, 0.62));
      });
      yield* coroutines.waitForTime(flashTime);
    }
    this.cleanup();
  }

  cleanup = () => {
    if (this.state.isCleaningUp) return;
    this.state.isCleaningUp = true;
    const { p5, cachedCallbacks, callbacks } = this.props;
    const { draw, keyPressed } = cachedCallbacks;
    p5.draw = draw;
    p5.keyPressed = keyPressed;
    this.stopAllCoroutines();
    if (callbacks.onSceneEnded) callbacks.onSceneEnded();
  }

  keyPressed = () => {
    if (!this.state.isTimeElapsed) return;
    if (this.state.isCleaningUp) return;
    if (!this.props.p5.keyIsPressed) return;
    // this.cleanup();
  }

  // abstract test(): void;

  draw = () => {
    const { p5, fonts } = this.props;
    this.drawBackground();

    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.textAlign(p5.CENTER, p5.TOP);
    // p5.text(lorem, ...this.getRect(0.5, 0.5, 250, 250));
    p5.text('now entering', ...this.getPosition(0.5, 0.4));
    p5.textSize(32);
    p5.fill('#fff');
    p5.text('THE FACILITY', ...this.getPosition(0.5, 0.5));

    this.tickCoroutines();
  }

  private drawBackground = () => {
    const { p5 } = this.props;
    p5.fill('#000');
    p5.stroke('#fff');
    p5.strokeWeight(1);
    p5.square(0, 0, Math.max(DIMENSIONS.x, DIMENSIONS.y));
  }

  private getPosition = (x: number, y: number): [number, number] => {
    const x1 = DIMENSIONS.x * x;
    const y1 = DIMENSIONS.y * y;
    return [x1, y1];
  }

  private getRect = (x: number, y: number, width: number, height: number): [number, number, number, number] => {
    const x1 = DIMENSIONS.x * x - width / 2;
    const y1 = DIMENSIONS.y * y - height / 2;
    const x2 = width;
    const y2 = height;
    return [x1, y1, x2, y2];
  }

  private tickCoroutines = () => {
    this.props.coroutines.tick();
  }

  private startCoroutine = (action: IEnumerator) => {
    this.props.coroutines.start(action);
  }

  private stopAllCoroutines = () => {
    this.props.coroutines.stopAll();
  }
}

const lorem = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Arcu non sodales neque sodales. Massa placerat duis ultricies lacus sed turpis tincidunt. At ultrices mi tempus imperdiet. Tempus urna et pharetra pharetra massa massa ultricies mi. Aliquam ultrices sagittis orci a scelerisque purus. Mi ipsum faucibus vitae aliquet nec ullamcorper sit amet. Vivamus arcu felis bibendum ut tristique et egestas quis ipsum. Diam maecenas sed enim ut. Lacus sed viverra tellus in hac habitasse. Laoreet non curabitur gravida arcu ac. Egestas dui id ornare arcu odio ut sem nulla. Elementum sagittis vitae et leo. Bibendum at varius vel pharetra vel.

Orci sagittis eu volutpat odio. In hendrerit gravida rutrum quisque non tellus orci ac. Sed velit dignissim sodales ut eu sem integer vitae justo. Vitae proin sagittis nisl rhoncus mattis rhoncus urna neque viverra. Pellentesque habitant morbi tristique senectus et. Sit amet porttitor eget dolor morbi. Cras ornare arcu dui vivamus arcu felis bibendum ut tristique. Pellentesque adipiscing commodo elit at imperdiet dui accumsan sit. Pretium quam vulputate dignissim suspendisse in. Mi bibendum neque egestas congue quisque egestas diam in arcu. Tristique senectus et netus et malesuada fames ac. Ultrices tincidunt arcu non sodales neque sodales ut. Maecenas accumsan lacus vel facilisis. In vitae turpis massa sed elementum tempus egestas sed sed. Aliquet eget sit amet tellus.

Arcu dictum varius duis at. Mauris pellentesque pulvinar pellentesque habitant. Id diam vel quam elementum pulvinar etiam. Faucibus pulvinar elementum integer enim neque volutpat ac tincidunt. Risus viverra adipiscing at in tellus integer feugiat scelerisque varius. Mauris nunc congue nisi vitae suscipit tellus. Tortor posuere ac ut consequat semper viverra nam libero justo. Imperdiet dui accumsan sit amet. Sit amet nisl suscipit adipiscing bibendum est ultricies integer quis. Pellentesque elit eget gravida cum sociis. Consequat ac felis donec et odio pellentesque. Viverra aliquet eget sit amet tellus cras adipiscing enim eu. Amet consectetur adipiscing elit ut aliquam purus. Vehicula ipsum a arcu cursus vitae congue mauris.

Donec massa sapien faucibus et. Aenean vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi. Augue interdum velit euismod in pellentesque. Rhoncus mattis rhoncus urna neque viverra. Venenatis urna cursus eget nunc scelerisque. Penatibus et magnis dis parturient montes nascetur ridiculus mus. Turpis massa sed elementum tempus egestas sed sed. Arcu dictum varius duis at consectetur lorem. Aliquet nec ullamcorper sit amet risus nullam eget felis eget. In vitae turpis massa sed. Luctus accumsan tortor posuere ac ut consequat semper. Adipiscing diam donec adipiscing tristique risus nec feugiat. Lacus suspendisse faucibus interdum posuere lorem ipsum. Elit ut aliquam purus sit amet luctus venenatis lectus magna. Vulputate enim nulla aliquet porttitor lacus. Arcu ac tortor dignissim convallis aenean et tortor.

Volutpat est velit egestas dui id. Pulvinar elementum integer enim neque. Rhoncus urna neque viverra justo. Quam nulla porttitor massa id neque aliquam vestibulum morbi. Volutpat est velit egestas dui id. Mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Habitasse platea dictumst vestibulum rhoncus est pellentesque elit. Libero volutpat sed cras ornare arcu dui vivamus. Sed lectus vestibulum mattis ullamcorper velit sed. Tristique sollicitudin nibh sit amet commodo nulla. Scelerisque eleifend donec pretium vulputate sapien nec sagittis aliquam. Quis vel eros donec ac. Ullamcorper a lacus vestibulum sed arcu non odio euismod lacinia. Diam volutpat commodo sed egestas egestas fringilla.
`;
