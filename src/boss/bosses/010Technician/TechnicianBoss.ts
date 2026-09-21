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
  shuffleArray,
} from "@/utils";
import { BaseBoss, BossConstructorArgs } from "../../BaseBoss";
import { TechnicianStartScene } from "./TechnicianStartScene";
import { GRIDCOUNT_X, GRIDCOUNT_Y, HURT_FLASH_RATE, INVINCIBILITY_EXPIRE_FLASH_MS, IS_LOCALHOST, LASER_WARN_LIFETIME } from "@/constants";


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

  private get phase() { return this.phases[this.difficulty]?.[this.phaseIdx] || BossAgro.L3; }
  protected readonly phases: Record<DifficultyIndex, BossAgro[]> = {
    1: [BossAgro.L1, BossAgro.L2, BossAgro.L3],
    2: [BossAgro.L1, BossAgro.L2, BossAgro.L3],
    3: [BossAgro.L1, BossAgro.L2, BossAgro.L3, BossAgro.L4],
    4: [BossAgro.L1, BossAgro.L2, BossAgro.L3, BossAgro.L4],
  };

  private readonly applesToSpawn: Record<DifficultyIndex, number[]> = {
    1: [4, 6, 6],
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
    }
  };

  public draw = (deltaTime: number) => {
    if (!this.active) return;
    let bossCoord = -1;
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
        switch (circuitState) {
          case CircuitState.Weak:
            this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitWeak, x, y, this.gameState.actualTimeElapsed, 0, 1, 0);
            break;
          case CircuitState.Hit:
            this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitHit, x, y, this.gameState.actualTimeElapsed, 0, 1, 0);
            break;
          case CircuitState.Off:
            this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTileCircuitOff, x, y, this.gameState.actualTimeElapsed, 0, 1, 0);
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
    if (bossCoord >= 0) {
      const x = getCoordX(bossCoord);
      const y = getCoordY(bossCoord);
      const elapsed = this.gameState.actualTimeElapsed;
      if (this.stateMachine === BossStateMachine.TakingDamage) {
        if (this.damage === BossDamage.Activating) {
          this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTechnicianIdle, x, y, elapsed, 0, 1, 0);
        } else if (this.damage === BossDamage.Inflicting) {
          this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTechnicianHurt, x, y, elapsed, 0, 1, 0);
        } else if (this.damage === BossDamage.Post) {
          const blink = Math.floor(elapsed / 100) % 2 === 0;
          if (blink) this.p5.push();
          if (blink) this.p5.tint(0, 0, 0, 255);
          this.spriteRenderer.drawSprite1x1(this.p5, Image.BossTechnician, x, y, 3, 0, 1, 0);
          if (blink) this.p5.pop();
        } else {
          // invalid
          this.spriteRenderer.drawImage1x1(this.p5, Image.__TEST__, x, y, 0, 1, 0);
        }
      } else if (this.stateMachine === BossStateMachine.Dying) {
        this.spriteRenderer.drawSprite1x1(this.p5, Image.BossTechnician, x, y, 3, 0, 1, 0);
      } else if (this.stateMachine === BossStateMachine.Fighting || this.stateMachine === BossStateMachine.Intro) {
        this.spriteRenderer.drawSpritesheetAnim1x1(this.p5, SpritesheetRange.BossTechnicianIdle, x, y, elapsed, 0, 1, 0);
      } else {
        // draw nothing
      }
    } else {
      // invalid
      this.spriteRenderer.drawImage1x1(this.p5, Image.__TEST__, 15, 15, 0, 1, 0);
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
    this.stateMachine = BossStateMachine.Fighting;
  }

  private * takeDamageRoutine() {
    this.stateMachine = BossStateMachine.TakingDamage;
    const prevTimeScale = this.loopState.timeScale;
    this.loopState.timeScale = 0;

    const coroutines = this.coroutines;
    const bossCoord = this.getBossCoord();
    this.gameState.isDeathIlluminating = true;

    // snek charges up
    // TODO: ADD CHARGE UP SOUND
    this.damage = BossDamage.Activating;
    this.sfx.play(Sound.acquireShield, 0.2);
    this.es.deathIlluminationMap = {};
    this.es.deathIlluminationMap = {};
    this.es.deathIlluminationMap[getCoordIndex(this.player.position)] = true;
    for (let i = 0; i < this.segments.length; i++) {
      this.es.deathIlluminationMap[getCoordIndex(this.segments.get(i))] = true;
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
    this.es.deathIlluminationMap = {};
    this.es.deathIlluminationMap[bossCoord] = true;
    this.es.deathIlluminationMap[bossCoord + 1] = true;
    this.es.deathIlluminationMap[bossCoord + GRIDCOUNT_X] = true;
    this.es.deathIlluminationMap[bossCoord + GRIDCOUNT_X + 1] = true;
    yield* coroutines.waitForTime(200);
    const targetHp = lerp(100, 0, (this.phaseIdx + 1) / this.phases[this.difficulty].length);
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
    this.es.deathIlluminationMap = {};
    this.weakpointsActive = false;
    this.circuits = {};

    if (this.hp <= 0) {
      this.loopState.timeScale = 1;
      this.die();
    } else {
      this.phaseIdx++;
      this.gameState.currentSpeed = 0;
      this.loopState.timeScale = prevTimeScale;
      this.updateLasers();
      this.updateCircuits();
      this.sfx.play(Sound.xpound);
      yield* coroutines.waitForTime(500);
      yield* this.spawnApples();
      this.damage = BossDamage.None;
      this.stateMachine = BossStateMachine.Fighting;
    }
  }

  private * dieRoutine() {
    this.stateMachine = BossStateMachine.Dying;
    const es = this.es;
    const threats = this.threats;
    const coroutines = this.coroutines;
    const prevTimeScale = this.loopState.timeScale;
    this.loopState.timeScale = 0;

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
        this.spawnExplosion(getCoordX(coord), getCoordY(coord));
        this.sfx.play(Sound.xplode3);
        yield* coroutines.waitForTime(80);
      }
    }
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < explosionCoords.length; j++) {
        const coord = explosionCoords[j];
        this.spawnExplosion(getCoordX(coord), getCoordY(coord));
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
      this.spawnSmoke(x, y, SmokeType.Large);
    })

    // blow up lasers
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
          yield* coroutines.waitForTime(100);
        }
      }
    }

    yield* coroutines.waitForTime(300);

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
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        if (active[coord]) {
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
