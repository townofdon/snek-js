import {
  Scene,
  BossAgro,
  BossStartArgs,
  BossStateMachine,
  MapAnnotation,
  DifficultyIndex,
  Image,
  SpritesheetRange,
  ThreatType,
  ThreatFlag,
  Action,
  RemovalReason,
  Sound,
  BarrierType,
  SmokeType,
  BossDamage,
  BossComponentFrame,
} from "@/types";
import {
  coordToVec,
  getAnnotationSlice,
  getCoordIndex,
  getCoordIndex2,
  getCoordX,
  getCoordY,
  getCurrentFrame,
  getFrameOffset,
  isAtMapEdge,
  lerp,
  recalculateLasersMap,
  shuffleArray,
  triangle,
} from "@/utils";
import { BaseBoss, BossConstructorArgs } from "../../BaseBoss";
import { TechnicianStartScene } from "./TechnicianStartScene";
import { GRIDCOUNT_X, GRIDCOUNT_Y, IS_LOCALHOST, LASER_WARN_LIFETIME } from "@/constants";
import { Easing } from "@/easing";


enum CircuitState {
  None = 0,
  Off,
  Weak,
  Hit,
}

export class TheTechnician extends BaseBoss {
  private active: boolean = false;
  private weakpointsActive: boolean = false;
  private stateMachine: BossStateMachine = 0;
  private damage: BossDamage = 0;
  private phaseIdx = 0;
  private circuits: Record<number, CircuitState>;

  private hp = 100;
  private spawnThreatsCoroutine: string;
  private timeSinceLastPhaseStart = 0;

  private get phase() { return this.phases[this.difficulty]?.[this.phaseIdx] || BossAgro.L3; }
  protected readonly phases: Record<DifficultyIndex, BossAgro[]> = {
    1: [BossAgro.L1, BossAgro.L2, BossAgro.L3],
    2: [BossAgro.L1, BossAgro.L2, BossAgro.L3],
    3: [BossAgro.L1, BossAgro.L2, BossAgro.L3, BossAgro.L4],
    4: [BossAgro.L1, BossAgro.L2, BossAgro.L3, BossAgro.L4],
  };

  private readonly applesToSpawn: Record<DifficultyIndex, number[]> = {
    1: [4, 6, 7],
    2: [6, 7, 8],
    3: [8, 8, 10, 12],
    4: [10, 12, 14, 16],
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
    this.damage = 0;
    this.stateMachine = BossStateMachine.Intro;
    this.updateLasers();
    const scene = new TechnicianStartScene(...args);
    scene.intro();
    this.startScene = scene;
    return this.startScene;
  };
  public quickIntro = (...args: BossStartArgs) => {
    this.active = false;
    this.phaseIdx = 0;
    this.damage = 0;
    this.startScene?.cleanup();
    this.coroutines.stopAll();
    this.stateMachine = BossStateMachine.Intro;
    this.updateLasers();
    const scene = new TechnicianStartScene(...args);
    scene.quickIntro();
    this.startScene = scene;
    return this.startScene;
  };
  public start = () => {
    this.active = true;
    this.startAction(this.startRoutine(), Action.BossTransition);
  }
  public cleanup = () => {
    this.active = false;
    this.startScene?.cleanup();
    this.startScene = null;
  };
  public tick = (deltaTime: number) => {
    if (!this.active) return;
    if (this.stateMachine !== BossStateMachine.Fighting) return;
    let countCircuitsWeak = 0;
    let countCircuitsHit = 0;
    let countApplesLeft = 0;
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        // trigger weak points
        if (this.weakpointsActive) {
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
    if (this.weakpointsActive
      && countCircuitsHit > 0
      && countCircuitsWeak === 0
    ) {
      this.takeDamage();
    }
    if (!this.weakpointsActive
      && countApplesLeft === 0
    ) {
      this.sfx.play(Sound.switch);
      this.weakpointsActive = true;
      if (!this.isFinalPhase()) {
        this.timeSinceLastPhaseStart = this.gameState.actualTimeElapsed;
        this.coroutines.start(this.lightRoutine());
      }
    }
  };

  public draw = (deltaTime: number) => {
    if (!this.active) return;
    let bossCoord = -1;

    // draw circuits
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      if (this.annotations[coord] === MapAnnotation.L7) {
        bossCoord = coord;
      }
      if (this.circuits[coord]) {
        const x = getCoordX(coord);
        const y = getCoordY(coord);
        let circuitState = CircuitState.None;
        if (this.stateMachine === BossStateMachine.TakingDamage) {
          if (this.damage === BossDamage.Post) {
            circuitState = CircuitState.Off;
          } else {
            circuitState = CircuitState.Hit;
          }
        } else if (this.circuits[coord] === CircuitState.Hit && this.weakpointsActive) {
          circuitState = CircuitState.Hit;
        } else if (this.circuits[coord] === CircuitState.Weak && this.weakpointsActive) {
          circuitState = CircuitState.Weak;
        } else if (this.circuits[coord] === CircuitState.Weak && !this.weakpointsActive) {
          circuitState = CircuitState.Off;
        } else if (this.circuits[coord] === CircuitState.Off) {
          circuitState = CircuitState.Off;
        }
        const shakeMul = 0.5;
        const elapsed = this.gameState.actualTimeElapsed;
        this.es.illuminationMap[coord] = 0;
        switch (circuitState) {
          case CircuitState.Weak:
            const frame: BossComponentFrame = getCurrentFrame(SpritesheetRange.BossTileCircuitWeak, elapsed) + getFrameOffset(SpritesheetRange.BossTileCircuitWeak)
            const lightMap = {
              [BossComponentFrame.TileCircuitWeak0 - 1]: 0.2,
              [BossComponentFrame.TileCircuitWeak1 - 1]: 0.4,
              [BossComponentFrame.TileCircuitWeak2 - 1]: 0.9,
              [BossComponentFrame.TileCircuitWeak3 - 1]: 0.4,
            };
            this.es.illuminationMap[coord] = lightMap[frame] || 0.1;
            this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitWeak, x, y, elapsed, 0, 1, shakeMul);
            break;
          case CircuitState.Hit:
            this.es.illuminationMap[coord] = lightMap[frame] || 0.1;
            this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitHit, x, y, elapsed, 0, 1, shakeMul);
            break;
          case CircuitState.Off:
            this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitOff, x, y, elapsed, 0, 1, shakeMul);
            break;
          case CircuitState.None:
            if (IS_LOCALHOST) {
              // draw something obviously incorrect
              this.spriteRenderer.drawImage1x1(this.p5, Image.__TEST__, x, y, 0, 1, 0);
            }
            break;
        }
      }
    }

    // draw boss
    if (bossCoord >= 0) {
      const shakeMul = 0.9;
      const x = getCoordX(bossCoord);
      const y = getCoordY(bossCoord);
      const elapsed = this.gameState.actualTimeElapsed;
      if (this.stateMachine === BossStateMachine.TakingDamage) {
        if (this.damage === BossDamage.Activating) {
          this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTechnicianIdle, x, y, elapsed, 0, 1, shakeMul);
        } else if (this.damage === BossDamage.Inflicting) {
          this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTechnicianHurt, x, y, elapsed, 0, 1, shakeMul);
        } else if (this.damage === BossDamage.Post) {
          const blink = Math.floor(elapsed / 100) % 2 === 0;
          if (blink) this.p5.push();
          if (blink) this.p5.tint(0, 0, 0, 255);
          this.spriteRenderer.drawSprite1x1(this.p5, Image.BossTechnician, x, y, 3, 0, 1, shakeMul);
          if (blink) this.p5.pop();
        } else {
          // invalid
          this.spriteRenderer.drawImage1x1(this.p5, Image.__TEST__, x, y, 0, 1, 0);
        }
      } else if (this.stateMachine === BossStateMachine.Dying) {
        this.spriteRenderer.drawSprite1x1(this.p5, Image.BossTechnician, x, y, 3, 0, 1, 0);
      } else if (this.stateMachine === BossStateMachine.Fighting || this.stateMachine === BossStateMachine.Intro) {
        const angry = this.isFinalPhase() && this.loopState.timeScale > 0;
        const t = triangle(((elapsed - this.timeSinceLastPhaseStart) / (1200 / 2)) % 2);
        if (angry) this.p5.push();
        if (angry) this.p5.tint(255, (1 - t) * 255, (1 - t) * 255, 255);
        this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTechnicianIdle, x, y, elapsed, 0, 1, shakeMul);
        if (angry) this.p5.pop();
      } else {
        // draw nothing
      }
    } else {
      // invalid
      this.spriteRenderer.drawImage1x1(this.p5, Image.__TEST__, 15, 15, 0, 1, 0);
    }

    // light boss
    if (this.stateMachine === BossStateMachine.Fighting) {
      this.es.illuminationMap[bossCoord] = 1;
      this.es.illuminationMap[bossCoord + 1] = 1;
      this.es.illuminationMap[bossCoord + GRIDCOUNT_X] = 1;
      this.es.illuminationMap[bossCoord + GRIDCOUNT_X + 1] = 1;
    }

    this.coroutines.tick();
  };

  protected takeDamage = () => {
    this.startAction(this.takeDamageRoutine(), Action.BossTransition);
  };
  protected die = () => {
    this.stateMachine = BossStateMachine.Dying;
    this.startAction(this.dieRoutine(), Action.BossTransition);
  };

  private * startRoutine() {
    this.updateCircuits();
    yield* this.spawnApples();
    yield* this.spawnThreats();
    this.stateMachine = BossStateMachine.Fighting;
  }

  private isFinalPhase() {
    return this.phaseIdx / (this.phases[this.difficulty].length - 1) >= 1;
  }

  private * takeDamageRoutine() {
    const coroutines = this.coroutines;
    this.stateMachine = BossStateMachine.TakingDamage;
    const prevTimeScale = this.loopState.timeScale;
    this.loopState.timeScale = 0;
    const bossCoord = this.getBossCoord();
    this.gameState.isDeathIlluminating = true;
    this.gameState.globalLightOverride = undefined;
    coroutines.stop(this.spawnThreatsCoroutine);

    // snek charges up
    // TODO: ADD CHARGE UP SOUND
    this.damage = BossDamage.Activating;
    this.sfx.play(Sound.acquireShield, 0.2);
    this.es.illuminationMap = {};
    this.es.illuminationMap = {};
    this.es.illuminationMap[getCoordIndex(this.player.position)] = 1;
    for (let i = 0; i < this.segments.length; i++) {
      this.es.illuminationMap[getCoordIndex(this.segments.get(i))] = 1;
    }
    yield* coroutines.waitForTime(1250, (t) => {
      const t2 = (t * 6) % 1;
      this.gameState.acquireProgression = t2;
    });
    this.sfx.stop(Sound.acquireShield);
    this.gameState.acquireProgression = 0;

    // electrocute boss
    this.sfx.play(Sound.switchOff);
    this.damage = BossDamage.Inflicting;
    this.es.illuminationMap = {};
    this.es.illuminationMap[bossCoord] = 1;
    this.es.illuminationMap[bossCoord + 1] = 1;
    this.es.illuminationMap[bossCoord + GRIDCOUNT_X] = 1;
    this.es.illuminationMap[bossCoord + GRIDCOUNT_X + 1] = 1;
    yield* coroutines.waitForTime(200);
    const targetHp = lerp(100, 0, (this.phaseIdx + 1) / this.phases[this.difficulty].length);
    if (targetHp <= 0) {
      this.musicPlayer.stopAllTracks();
    }
    const currentHp = this.hp;
    this.sfx.playLoop(Sound.electrocuteLoop);
    yield* coroutines.waitForTime(1250, (t) => {
      this.hp = lerp(currentHp, targetHp, t);
      // TODO: UPDATE BOSS HEALTH BAR
      console.log(`hp=${this.hp}`);
    });
    this.sfx.stop(Sound.electrocuteLoop);
    yield* coroutines.waitForTime(80);

    this.damage = BossDamage.Post;
    this.hp = targetHp;
    this.gameState.isDeathIlluminating = false;
    this.es.illuminationMap = {};
    this.weakpointsActive = false;
    this.circuits = {};

    if (this.hp <= 0) {
      this.loopState.timeScale = 1;
      this.die();
    } else {
      this.sfx.play(Sound.xpound);
      yield* coroutines.waitForTime(340);
      yield* this.removeThreats(50, false);
      this.phaseIdx++;
      this.updateLasers();
      this.updateCircuits();
      yield* coroutines.waitForTime(160);
      yield* this.spawnThreats();
      yield* this.spawnApples();
      this.spawnPowerups();
      this.spawnThreatsCoroutine = this.coroutines.start(this.spawnThreatsRoutine());
      this.gameState.currentSpeed = 0;
      this.sfx.play(Sound.moveStart);
      this.loopState.timeScale = prevTimeScale;
      this.timeSinceLastPhaseStart = this.gameState.actualTimeElapsed;
      this.damage = BossDamage.None;
      this.stateMachine = BossStateMachine.Fighting;
      if (this.isFinalPhase()) {
        coroutines.start(this.lightRoutine());
      }
    }
  }

  private * dieRoutine() {
    this.stateMachine = BossStateMachine.Dying;
    const coroutines = this.coroutines;
    const prevTimeScale = this.loopState.timeScale;
    this.loopState.timeScale = 0;
    this.coroutines.stop(this.spawnThreatsCoroutine);

    let explosionCoords = [];
    let bossCoord = -1;
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        if (this.annotations[coord] === MapAnnotation.L7 || this.annotations[coord] === MapAnnotation.L8) {
          if (!explosionCoords.includes(coord)) {
            explosionCoords.push(coord);
          }
        }
        if (this.annotations[coord] === MapAnnotation.L7) {
          bossCoord = coord;
        }
      }
    }
    for (let i = 0; i < 5; i++) {
      explosionCoords = shuffleArray(explosionCoords);
    }
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < explosionCoords.length; j++) {
        const coord = explosionCoords[j];
        this.spawnExplosionAt(getCoordX(coord), getCoordY(coord));
        this.sfx.play(Sound.xplode3);
        yield* coroutines.waitForTime(80);
      }
    }
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < explosionCoords.length; j++) {
        const coord = explosionCoords[j];
        this.spawnExplosionAt(getCoordX(coord), getCoordY(coord));
        this.sfx.play(Sound.xplode3);
        yield* coroutines.waitForTime(30);
      }
    }

    this.stateMachine = BossStateMachine.Defeated;
    this.damage = BossDamage.None;
    const smokeCoords = bossCoord >= 0 ? [
      bossCoord,
      bossCoord + 1,
      bossCoord + GRIDCOUNT_X,
      bossCoord + GRIDCOUNT_X + 1,
    ] : [];
    smokeCoords.forEach(coord => {
      const x = getCoordX(coord);
      const y = getCoordY(coord);
      this.spawnSmokeAt(x, y, SmokeType.Large);
    });

    yield* this.removeThreats(100, true);
    yield* coroutines.waitForTime(300);

    this.sfx.play(Sound.doorOpenHuge);
    while(this.sfx.isPlaying(Sound.doorOpenHuge)) {
      yield;
    }

    this.circuits = {};
    this.loopState.timeScale = prevTimeScale;
    this.gameState.currentSpeed = 0;
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
    let anyActive = false;
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        if (active[coord]) {
          anyActive = true;
          if (es.threatsMap[coord] !== ThreatType.LaserDiode) {
            this.spawnLaserDiode(x, y);
          }
          threats.enable(x, y);
          threats.setLifetime(x, y, LASER_WARN_LIFETIME);
          const flags = this.phase >= BossAgro.L4
            ? (ThreatFlag.Activating | ThreatFlag.VariantA)
            : ThreatFlag.Activating;
          threats.addFlagAt(x, y, flags);
        }
      }
    }
    if (anyActive) {
      this.coroutines.start(this.alarmRoutine());
    }
    recalculateLasersMap(es, threats);
  }

  private * removeThreats(interval: number, removeLasers: boolean) {
    const { es, threats, coroutines } = this;
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const threat = es.threatsMap[getCoordIndex2(x, y)];
        if (!threat) {
          continue;
        }
        if (threat === ThreatType.LaserDiode && !removeLasers) {
          continue;
        }
        if (threat === ThreatType.LaserDiode && isAtMapEdge(x, y)) {
          const coord = getCoordIndex2(x, y);
          es.barriersMap[coord] = BarrierType.Default;
          es.barriers.push({ vec: coordToVec(coord), type: BarrierType.Default });
        }
        threats.remove(x, y, RemovalReason.Explode);
        recalculateLasersMap(es, threats);
        yield* coroutines.waitForTime(interval);
      }
    }
  }

  private * spawnApples() {
    const coroutines = this.coroutines;
    const numApplesToSpawn = this.applesToSpawn[this.difficulty]?.[this.phaseIdx] || 0;
    if (!numApplesToSpawn) {
      throw new Error(`numApplesToSpawn was zero for difficulty=${this.difficulty},phase=${this.phaseIdx}`);
    }
    for (let i = 0; i < numApplesToSpawn; i++) {
      const coord = this.spawnRegularApple();
      const x = getCoordX(coord);
      const y = getCoordY(coord);
      this.spawnPuffAt(x, y);
      this.sfx.play(Sound.waterSplash);
      yield* coroutines.waitForTime(80);
    }
    yield null;
  }

  private spawnPowerups() {
    if (this.phase < BossAgro.L2) return;
    const lives = this.gameState.lives;
    let chance = 0;
    if (lives <= 2) { chance = 0.3; }
    if (lives <= 1) { chance = 0.75; }
    if (lives <= 0) { chance = 1; }
    if (Math.random() <= chance) {
      this.spawnHealthPickup();
    }
  }

  private * spawnThreats() {
    const coroutines = this.coroutines;
    type SpawnCount = { bombs: number, coils: number, mines: number };
    const empty: Record<DifficultyIndex, SpawnCount> = {
      1: { bombs: 0, coils: 0, mines: 0 },
      2: { bombs: 0, coils: 0, mines: 0 },
      3: { bombs: 0, coils: 0, mines: 0 },
      4: { bombs: 0, coils: 0, mines: 0 },
    };
    const spawns: Record<BossAgro, Record<DifficultyIndex, SpawnCount>> = {
      0: { ...empty },
      1: { ...empty },
      2: { ...empty },
      3: { ...empty },
      4: { ...empty },
    };
    spawns[BossAgro.L1][1] = { bombs: 0, coils: 0, mines: 0 };
    spawns[BossAgro.L2][1] = { bombs: 0, coils: 2, mines: 0 };
    spawns[BossAgro.L3][1] = { bombs: 2, coils: 0, mines: 0 };
    spawns[BossAgro.L4][1] = { bombs: 2, coils: 0, mines: 0 };

    spawns[BossAgro.L1][2] = { bombs: 0, coils: 0, mines: 0 };
    spawns[BossAgro.L2][2] = { bombs: 0, coils: 2, mines: 0 };
    spawns[BossAgro.L3][2] = { bombs: 2, coils: 0, mines: 0 };
    spawns[BossAgro.L4][2] = { bombs: 2, coils: 2, mines: 0 };

    spawns[BossAgro.L1][3] = { bombs: 0, coils: 0, mines: 2 };
    spawns[BossAgro.L2][3] = { bombs: 0, coils: 2, mines: 4 };
    spawns[BossAgro.L3][3] = { bombs: 2, coils: 3, mines: 2 };
    spawns[BossAgro.L4][3] = { bombs: 4, coils: 4, mines: 0 };

    spawns[BossAgro.L1][4] = { bombs: 0, coils: 2, mines: 2 };
    spawns[BossAgro.L2][4] = { bombs: 2, coils: 3, mines: 4 };
    spawns[BossAgro.L3][4] = { bombs: 8, coils: 2, mines: 4 };
    spawns[BossAgro.L4][4] = { bombs: 6, coils: 4, mines: 2 };

    const numCoilsToSpawn = spawns[this.phase][this.difficulty].coils || 0;
    const numBombsToSpawn = spawns[this.phase][this.difficulty].bombs || 0;
    const numMinesToSpawn = spawns[this.phase][this.difficulty].mines || 0;
    for (let i = 0; i < numBombsToSpawn; i++) {
      this.spawnBomb(6000, 8000);
      yield* coroutines.waitForTime(80);
    }
    for (let i = 0; i < numCoilsToSpawn; i++) {
      this.spawnCoil(15000, 45000);
      yield* coroutines.waitForTime(80);
    }
    for (let i = 0; i < numMinesToSpawn; i++) {
      this.spawnMine(5000, 10000);
      yield* coroutines.waitForTime(80);
    }
    yield null;
  }

  private * spawnThreatsRoutine() {
    if (!this.isFinalPhase()) return;

    yield* this.coroutines.waitForTime(2000);
    type MinMax = { min: number, max: number };
    const repeat = (times: number) => <T,>(val: T) => {
      const arr: T[] = [];
      for (let i = 0; i < times; i++) {
        arr.push(val);
      }
      return arr;
    };
    while (this.stateMachine === BossStateMachine.Fighting) {
      let interval: MinMax = { min: 3000, max: 5000 } satisfies MinMax;
      if (this.difficulty < 3) interval = { min: 4000, max: 6000 } satisfies MinMax;
      if (this.difficulty < 2) interval = { min: 5000, max: 8000 } satisfies MinMax;
      let spawns: ThreatType[] = [...repeat(10)(ThreatType.ElectricCoil), ...repeat(2)(ThreatType.Bomb), ...repeat(5)(ThreatType.Mine)];
      if (this.difficulty < 2) spawns = [...repeat(10)(ThreatType.ElectricCoil), ...repeat(1)(ThreatType.Bomb), ...repeat(10)(ThreatType.Mine)];
      for (let i = 0; i < 5; i++) {
        spawns = shuffleArray(spawns);
      }
      for (let i = 0; i < spawns.length; i++) {
        yield* this.coroutines.waitForTime(lerp(interval.min, interval.max, Math.random() + Number.EPSILON));
        const threat = spawns[i];
        switch (threat) {
          case ThreatType.Mine:
            this.spawnMine(5000, 8000);
            break;
          case ThreatType.Bomb:
            this.spawnBomb(6000, 8000);
            break;
          case ThreatType.ElectricCoil:
            this.spawnCoil(5000, 8000);
            break;
        }
      }
      yield null;
    }
  }

  private spawnBomb(lifetimeMin: number, lifetimeMax: number) {
    const predicate = (coord: number) => !this.circuits[coord];
    const lifetime = lerp(lifetimeMin, lifetimeMax, Math.random() + Number.EPSILON);
    const coord = this.spawnThreat(ThreatType.Bomb, lifetime, predicate);
    const x = getCoordX(coord);
    const y = getCoordY(coord);
    this.spawnPuffAt(x, y);
    // TODO: UNIQUE SOUND
    this.sfx.play(Sound.waterSplash);
  }

  private spawnMine(lifetimeMin: number, lifetimeMax: number){
    const predicate = (coord: number) => !this.circuits[coord];
    const lifetime = lerp(lifetimeMin, lifetimeMax, Math.random() + Number.EPSILON);
    const coord = this.spawnThreat(ThreatType.Mine, lifetime, predicate);
    const x = getCoordX(coord);
    const y = getCoordY(coord);
    this.spawnPuffAt(x, y);
    // TODO: UNIQUE SOUND
    this.sfx.play(Sound.stab);
  }

  private spawnCoil(lifetimeMin: number, lifetimeMax: number) {
    const predicate = (coord: number) => !this.circuits[coord];
    const lifetime = lerp(lifetimeMin, lifetimeMax, Math.random() + Number.EPSILON);
    const coord = this.spawnThreat(ThreatType.ElectricCoil, lifetime, predicate);
    const x = getCoordX(coord);
    const y = getCoordY(coord);
    this.spawnPuffAt(x, y);
    // TODO: UNIQUE SOUND
    this.sfx.play(Sound.uiChip);
  }

  private * alarmRoutine() {
    yield* this.coroutines.waitForTime(500);
    this.sfx.playLoop(Sound.alarm);
    yield* this.coroutines.waitForTime(4000);
    this.sfx.stop(Sound.alarm);
  }

  private * lightRoutine() {
    while (this.stateMachine === BossStateMachine.Fighting) {
      const elapsed = this.gameState.actualTimeElapsed;
      const t = triangle(((elapsed - this.timeSinceLastPhaseStart) / (3000 / 2)) % 2);
      this.gameState.globalLightOverride = lerp(1, 0.1, Easing.inOutQuad(t));
      yield null;
    }
  }

  private spawnLaserDiode(x: number, y: number) {
    const flags = ThreatFlag.Activating;
    const coord = getCoordIndex2(x, y);
    this.es.barriersMap[coord] = null;
    this.es.doorsMap[coord] = null;
    let image: SpritesheetRange = SpritesheetRange.DiodeBlue;
    if (this.phase >= BossAgro.L4) {
      image = SpritesheetRange.DiodeRed;
    }
    this.threats.add(x, y, LASER_WARN_LIFETIME, image, ThreatType.LaserDiode, { replaceExisting: true, flags });
  }

  private getBossCoord = () => {
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        if (this.es.level.annotations[coord] === MapAnnotation.L7) {
          return coord;
        }
      }
    }
    return -1;
  }
}
