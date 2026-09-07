import { BaseBossScene } from "@/boss/BaseBossScene";
import { BossStartArgs, Sound } from "@/types";

export class TechnicianStartScene extends BaseBossScene {

  constructor(...args: BossStartArgs) {
    super(...args);
    this.bindActions();
  }

  *action() {
    const sfx = this.sfx;
    const { coroutines } = this.props;
    sfx.play(Sound.alarm);
    console.log('boss scene start');
    yield* coroutines.waitForTime(500);
    sfx.play(Sound.switch);
    console.log('boss: "I angry!"');
    yield* coroutines.waitForTime(1000);
    console.log('boss: "I keel you!"');
    sfx.play(Sound.switchOff);
    yield* coroutines.waitForTime(500);
    console.log('');
    this.cleanup();
  }
  keyPressed = () => {};
  draw = () => {
    this.renderLoop();
    this.tick();
  };
}
