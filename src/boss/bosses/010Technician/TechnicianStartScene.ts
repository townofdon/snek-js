import { BaseBossScene } from "@/boss/BaseBossScene";
import { IEnumerator } from "@/types";

export class TechnicianStartScene extends BaseBossScene {
  trigger = () => {
    this.stopAllCoroutines();
    this.bindActions();
  }
  *action(): IEnumerator {
    yield null;
    this.cleanup();
  }
  keyPressed: () => {};
  draw = () => {
    if (!this.isShowing()) return;
  };
}
