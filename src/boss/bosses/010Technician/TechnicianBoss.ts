import { Scene, BossPhase, BossStartArgs, BossStateMachine, MapAnnotation, DifficultyIndex } from "@/types";
import { BaseBoss, BossConstructorArgs } from "../../BaseBoss";
import { TechnicianStartScene } from "./TechnicianStartScene";
import { getAnnotationSlice, shuffleArray } from "@/utils";

const ANNOTATION_CIRCUIT_SPAWNS = MapAnnotation.L1;

enum CircuitState {
  None = 0,
  Idle,
  Weakpoint,
  Triggered,
}

export class TheTechnician extends BaseBoss {
  private active: boolean;
  private state: BossStateMachine;
  private phaseIdx = 0;
  private circuits: Record<number, CircuitState>;

  private readonly circuitSpawnLocations: Record<number, boolean> = getAnnotationSlice(this.annotations, ANNOTATION_CIRCUIT_SPAWNS);
  protected readonly phases: Record<DifficultyIndex, BossPhase[]> = {
    1: [BossPhase.Default, BossPhase.AgroLow],
    2: [BossPhase.Default, BossPhase.Default, BossPhase.AgroLow],
    3: [BossPhase.Default, BossPhase.Default, BossPhase.Default, BossPhase.AgroLow],
    4: [BossPhase.Default, BossPhase.Default, BossPhase.AgroLow, BossPhase.AgroHigh],
  };
  protected readonly numCircuitsToSpawn: Record<DifficultyIndex, number[]> = {
    1: [4, 4],
    2: [4, 4, 6],
    3: [4, 4, 4, 6],
    4: [4, 4, 6, 8],
  };
  protected startScene: Scene;

  constructor(args: BossConstructorArgs) {
    super(args);
    [1, 2, 3, 4].forEach((phase) => {
      const numPhases = this.phases[phase].length;
      const numSpawns = this.numCircuitsToSpawn[phase].length;
      if (numPhases !== numSpawns) throw new Error(`lengths do not match for phase="${phase}": ${numPhases} vs ${numSpawns}`);
    });
  }

  public getCurrentState = (): BossStateMachine => this.state;
  public getCurrentPhase = (): BossPhase => this.phases[this.difficulty]?.[this.phaseIdx] || BossPhase.AgroHigh;
  public start = (...args: BossStartArgs) => {
    this.active = true;
    this.phaseIdx = 0;
    this.state = BossStateMachine.Intro;
    this.startScene = new TechnicianStartScene(...args);
    this.spawnNewCircuits();
    return this.startScene;
  };
  public reset = (...args: BossStartArgs) => {
    this.active = true;
    this.phaseIdx = 0;
    this.startScene?.cleanup();
    this.state = BossStateMachine.QuickIntro;
    this.startScene = new TechnicianStartScene(...args);
    this.spawnNewCircuits();
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

    // ??hurt player at locations - handled by normal behavior??

    // show actionables, weak points, etc.

    // maybe boss.takeDamage()

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

  protected agro = () => {
    this.phaseIdx++;
    // start action
  };
  protected takeDamage = () => {
    // take damage
  };
  protected die = () => {
    this.state = BossStateMachine.Dying;
    // this.startAction(BossDeath);
  };

  private spawnNewCircuits = () => {
    this.circuits = {};
    // possible spawn locations
    let pool = Object.keys(this.circuitSpawnLocations).map(v => Number(v)).filter(Number.isInteger);
    console.log({ possibleSpawnLocations: pool });
    for (let i = 0; i < 5; i++) {
      pool = shuffleArray(pool);
    }
    const numSpawns = Math.min(
      this.numCircuitsToSpawn[this.difficulty]?.[this.phaseIdx] || 0,
      pool.length,
    );
    for (let i = 0; i < numSpawns; i++) {
      const next = pool.pop();
      this.circuits[next] = CircuitState.Idle;
    }
    console.log({ 'this.circuits': this.circuits });
  }
}
