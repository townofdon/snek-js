import { Scene, BossPhase, BossStartArgs, BossStateMachine } from "@/types";
import { BaseBoss } from "../../BaseBoss";
import { TechnicianStartScene } from "./TechnicianStartScene";

export class TheTechnician extends BaseBoss {
  private active: boolean;
  private state: BossStateMachine;
  private phaseIdx = 0;
  protected readonly phases: {
    easy: [BossPhase.Default, BossPhase.AgroLow],
    medium: [BossPhase.Default, BossPhase.Default, BossPhase.AgroLow],
    hard: [BossPhase.Default, BossPhase.Default, BossPhase.Default, BossPhase.AgroLow],
    ultra: [BossPhase.Default, BossPhase.Default, BossPhase.AgroLow, BossPhase.AgroHigh],
  };
  public getCurrentState = (): BossStateMachine => this.state;
  public getCurrentPhase = (): BossPhase => {
    switch (this.difficulty) {
      case 1:
        return this.phases.easy[this.phaseIdx] || BossPhase.AgroLow;
      case 2:
        return this.phases.medium[this.phaseIdx] || BossPhase.AgroLow;
      case 3:
        return this.phases.hard[this.phaseIdx] || BossPhase.AgroLow;
      case 4:
        return this.phases.ultra[this.phaseIdx] || BossPhase.AgroHigh;
      default:
        return BossPhase.AgroHigh;
    }
  };
  protected startScene: Scene;
  public start = (...args: BossStartArgs) => {
    this.active = true;
    this.phaseIdx = 0;
    this.state = BossStateMachine.Intro;
    this.startScene = new TechnicianStartScene(...args);
    return this.startScene;
  };
  public reset = (...args: BossStartArgs) => {
    this.active = true;
    this.phaseIdx = 0;
    this.startScene?.cleanup();
    this.state = BossStateMachine.QuickIntro;
    this.startScene = new TechnicianStartScene(...args);
    return this.startScene;
  };
  public cleanup = () => {
    this.active = false;
    this.startScene?.cleanup();
    this.startScene = null;
  };
  public tick = (deltaTime: number) => {
    if (!this.active) return;
    // tick boss actions

    // hurt player at locations

    // show actionables, weak points, etc.

    // maybe take damage

    // maybe spawn shit
  };
  public draw = (deltaTime: number) => {
    if (!this.active) return;
    // draw boss stuff
  };
  public spawnNextItemOverride = () => {
    if (!this.active) return;
    // spawn mines and shit
    return false;
  };

  private agro = () => {
    this.phaseIdx++;
    // start action
  };
  private takeDamage = () => {
    // take damage
  };
  private die = () => {
    this.state = BossStateMachine.Dying;
    // this.startAction(BossDeath);
  };
}
