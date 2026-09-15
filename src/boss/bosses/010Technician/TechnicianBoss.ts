import {
  Scene,
  BossAgro,
  BossStartArgs,
  BossStateMachine,
  MapAnnotation,
  DifficultyIndex,
  BossSubphase,
  Image,
  SpritesheetRange,
  ThreatType,
  ThreatFlag,
  Action,
  RemovalReason,
  Sound,
  BarrierType,
} from "@/types";
import {
  coordToVec,
  getAnnotationSlice,
  getCoordIndex,
  getCoordIndex2,
  getCoordX,
  getCoordY,
  isAtMapEdge,
  lerp,
  recalculateLasersMap,
} from "@/utils";
import { BaseBoss, BossConstructorArgs } from "../../BaseBoss";
import { TechnicianStartScene } from "./TechnicianStartScene";
import { GRIDCOUNT_X, GRIDCOUNT_Y, IS_LOCALHOST, LASER_WARN_LIFETIME } from "@/constants";


enum CircuitState {
  None = 0,
  Off,
  Weak,
  Hit,
}

export class TheTechnician extends BaseBoss {
  private active: boolean = false;
  private stateMachine: BossStateMachine = 0;
  private phaseIdx = 0;
  private subphase: BossSubphase = 0;
  private circuits: Record<number, CircuitState>;

  private hp = 100;
  private spawnApplesCoroutine: string;

  private get phase() { return this.phases[this.difficulty]?.[this.phaseIdx] || BossAgro.L3; }
  protected readonly phases: Record<DifficultyIndex, BossAgro[]> = {
    1: [BossAgro.L1, BossAgro.L2],
    2: [BossAgro.L1, BossAgro.L2, BossAgro.L3],
    3: [BossAgro.L1, BossAgro.L2, BossAgro.L3, BossAgro.L4],
    4: [BossAgro.L1, BossAgro.L2, BossAgro.L3, BossAgro.L4],
  };

  private readonly applesToSpawn: Record<DifficultyIndex, number[]> = {
    1: [4, 6],
    2: [6, 8, 10],
    3: [8, 8, 10, 12],
    4: [10, 10, 10, 12],
  };
  protected startScene: Scene;

  constructor(args: BossConstructorArgs) {
    super(args);
    [1, 2, 3, 4].forEach((phase) => {
      const numPhases = this.phases[phase].length;
      const numSpawns = this.applesToSpawn[phase].length;
      if (numPhases !== numSpawns) throw new Error(`lengths do not match for phase="${phase}": ${numPhases} vs ${numSpawns}`);
    });
  }

  public intro = (...args: BossStartArgs) => {
    this.active = false;
    this.phaseIdx = 0;
    this.stateMachine = BossStateMachine.Intro;
    this.subphase = BossSubphase.Default;
    this.updateLasers();
    const scene = new TechnicianStartScene(...args);
    this.startScene = scene;
    return this.startScene;
  };
  public quickIntro = (...args: BossStartArgs) => {
    this.active = false;
    this.phaseIdx = 0;
    this.startScene?.cleanup();
    this.stateMachine = BossStateMachine.QuickIntro;
    this.subphase = BossSubphase.Default;
    this.updateLasers();
    const scene = new TechnicianStartScene(...args);
    this.startScene = scene;
    return this.startScene;
  };
  public start = () => {
    this.active = true;
    this.updateCircuits();
    this.spawnApplesCoroutine = this.coroutines.start(this.spawnApples());
    this.stateMachine = BossStateMachine.Fighting;
    this.subphase = BossSubphase.Default;
  }
  public cleanup = () => {
    this.active = false;
    this.startScene?.cleanup();
    this.startScene = null;
  };
  public tick = (deltaTime: number) => {
    if (!this.active) return;
    let countCircuitsWeak = 0;
    let countCircuitsHit = 0;
    let countApplesLeft = 0;
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        // trigger weak points
        if (this.subphase === BossSubphase.WeakpointsActive) {
          if (getCoordIndex(this.player.position) === coord && this.circuits[coord] === CircuitState.Weak) {
            this.sfx.play(Sound.switchOff);
            this.circuits[coord] = CircuitState.Hit;
          }
          if (this.circuits[coord] === CircuitState.Weak) {
            countCircuitsWeak++;
          }
          if (this.circuits[coord] === CircuitState.Hit) {
            countCircuitsHit++;
          }
        }
        if (this.apples.existsAt(x, y)) {
          countApplesLeft++;
        }
      }
    }
    if (this.subphase === BossSubphase.WeakpointsActive
      && countCircuitsHit > 0
      && countCircuitsWeak === 0
    ) {
      this.takeDamage();
    } else if (this.subphase === BossSubphase.Default
      && countApplesLeft === 0
      && this.stateMachine === BossStateMachine.Fighting
      && !this.spawnApplesCoroutine
    ) {
      this.sfx.play(Sound.switch);
      this.subphase = BossSubphase.WeakpointsActive;
    }
    this.coroutines.tick();
  };

  public draw = (deltaTime: number) => {
    if (!this.active) return;
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      if (this.circuits[coord]) {
        const x = getCoordX(coord);
        const y = getCoordY(coord);
        if (this.subphase === BossSubphase.TakingDamage) {
          this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitHit, x, y, this.gameState.actualTimeElapsed, 0, 1, 0);
        } else if (this.circuits[coord] === CircuitState.Hit && this.subphase === BossSubphase.WeakpointsActive) {
          this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitHit, x, y, this.gameState.actualTimeElapsed, 0, 1, 0);
        } else if (this.circuits[coord] === CircuitState.Weak && this.subphase === BossSubphase.WeakpointsActive) {
          this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitWeak, x, y, this.gameState.actualTimeElapsed, 0, 1, 0);
        } else if (this.circuits[coord] === CircuitState.Weak && this.subphase !== BossSubphase.WeakpointsActive) {
          this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitOff, x, y, this.gameState.actualTimeElapsed, 0, 1, 0);
        } else if (this.circuits[coord] === CircuitState.Off) {
          this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitOff, x, y, this.gameState.actualTimeElapsed, 0, 1, 0);
        } else if (IS_LOCALHOST) {
          // draw something obviously incorrect
          this.spriteRenderer.drawImage1x1(this.p5, Image.__TEST__, x, y, 0, 1, 0);
        }
      }
    }
  };

  protected takeDamage = () => {
    this.startAction(this.takeDamageRoutine(), Action.BossTransition);
  };
  protected die = () => {
    this.startAction(this.dieRoutine(), Action.BossTransition);
  };

  private * takeDamageRoutine() {
    this.stateMachine = BossStateMachine.Fighting;
    this.subphase = BossSubphase.TakingDamage;
    const prevTimeScale = this.loopState.timeScale;
    this.loopState.timeScale = 0;
    const coroutines = this.coroutines;
    const targetHp = lerp(100, 0, (this.phaseIdx + 1) / this.phases[this.difficulty].length);
    const currentHp = this.hp;
    this.sfx.playLoop(Sound.electrocuteLoop);
    yield* coroutines.waitForTime(1500, (t) => {
      this.hp = lerp(currentHp, targetHp, t);
      console.log(`hp=${this.hp}`);
    });
    this.sfx.stop(Sound.electrocuteLoop);
    this.loopState.timeScale = prevTimeScale;
    this.hp = targetHp;
    if (this.hp <= 0) {
      this.die();
    } else {
      this.phaseIdx++;
      this.updateCircuits();
      this.updateLasers();
      this.coroutines.stop(this.spawnApplesCoroutine);
      this.spawnApplesCoroutine = this.coroutines.start(this.spawnApples());
      this.subphase = BossSubphase.Default;
      this.gameState.currentSpeed = 1;
    }
  }

  private * dieRoutine() {
    this.stateMachine = BossStateMachine.Dying;
    this.subphase = BossSubphase.TakingDamage;
    const es = this.es;
    const threats = this.threats;
    const coroutines = this.coroutines;
    const prevTimeScale = this.loopState.timeScale;
    this.loopState.timeScale = 0;

    // TODO: BOSS DEATH
    // spawn explosion at random position at boss death positions
    // repeat 10 times

    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        if (es.threatsMap[getCoordIndex2(x, y)] === ThreatType.LaserDiode) {
          if (isAtMapEdge(x, y)) {
            const coord = getCoordIndex2(x, y);
            es.barriersMap[coord] = BarrierType.Default;
            es.barriers.push({ vec: coordToVec(coord), type: BarrierType.Default });
          }
          threats.remove(x, y, RemovalReason.Explode);
          recalculateLasersMap(es, threats);
          yield* coroutines.waitForTime(200);
        }
      }
    }
    this.circuits = {};
    this.loopState.timeScale = prevTimeScale;
    this.stateMachine = BossStateMachine.Defeated;
    this.subphase = BossSubphase.None;
    this.gameState.currentSpeed = 1;
    this.sfx.play(Sound.doorOpen);
    this.openDoors();
  }

  private updateCircuits = () => {
    this.circuits = {};
    let locations: Record<number, boolean> = {};
    if (this.phase >= BossAgro.L1) {
      locations = { ...locations, ...getAnnotationSlice(this.annotations, MapAnnotation.L1), }
    }
    if (this.phase >= BossAgro.L2) {
      locations = { ...locations, ...getAnnotationSlice(this.annotations, MapAnnotation.L2), }
    }
    if (this.phase >= BossAgro.L3) {
      locations = { ...locations, ...getAnnotationSlice(this.annotations, MapAnnotation.L3), }
    }
    if (this.phase >= BossAgro.L4) {
      locations = { ...locations, ...getAnnotationSlice(this.annotations, MapAnnotation.L4), }
    }
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      if (locations[coord]) {
        this.circuits[coord] = CircuitState.Weak;
      }
    }
  }

  private updateLasers() {
    const es = this.es;
    const threats = this.threats;
    let active: Record<number, boolean> = {};
    if (this.phase >= BossAgro.L3) {
      active = { ...active, ...getAnnotationSlice(this.annotations, MapAnnotation.L5), }
    }
    if (this.phase >= BossAgro.L4) {
      active = { ...active, ...getAnnotationSlice(this.annotations, MapAnnotation.L6), }
    }
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        if (active[coord]) {
          if (es.threatsMap[coord] !== ThreatType.LaserDiode) {
            this.spawnLaserDiode(x, y);
          }
          threats.enable(x, y);
          threats.setLifetime(x, y, LASER_WARN_LIFETIME);
          threats.addFlagAt(x, y, ThreatFlag.Activating);
          if (this.phase >= BossAgro.L4) {
            threats.addFlagAt(x, y, ThreatFlag.VariantA);
          }
        }
      }
    }
    recalculateLasersMap(es, threats);
  }

  private * spawnApples() {
    const coroutines = this.coroutines;
    const numApplesToSpawn = this.applesToSpawn[this.difficulty]?.[this.phaseIdx] || 0;
    if (!numApplesToSpawn) {
      throw new Error(`numApplesToSpawn was zero for difficulty=${this.difficulty},phase=${this.phaseIdx}`);
    }
    for (let i = 0; i < numApplesToSpawn; i++) {
      const coord = this.spawnOnlyApple();
      const x = getCoordX(coord);
      const y = getCoordY(coord);
      this.spawnPuff(x, y);
      this.sfx.play(Sound.waterSplash);
      yield* coroutines.waitForTime(80);
    }
    this.spawnApplesCoroutine = undefined;
  }

  private spawnLaserDiode(x: number, y: number) {
    const flags = ThreatFlag.Activating;
    const coord = getCoordIndex2(x, y);
    this.es.barriersMap[coord] = null;
    this.es.doorsMap[coord] = null;
    this.threats.add(x, y, LASER_WARN_LIFETIME, SpritesheetRange.DiodeBlue, ThreatType.LaserDiode, { replaceExisting: true, flags });
  }
}
