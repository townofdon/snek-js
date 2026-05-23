import { Vector } from 'p5';
import { DIFFICULTY_EASY } from '@/constants';
import {
  DIR,
  EditorData,
  EditorOptions,
  MusicTrack,
  PipeVariant,
  PortalExitMode,
  Replay,
  ReplayMode,
  ScreenShakeState,
  Tutorial,
} from "../types";
import { PALETTE } from '../palettes';
import { buildLevel } from '../levels/levelBuilder';
import { LEVEL_01 } from '../levels/campaign/level01';
import { DEFAULT_GAME_STATE } from '@/defaults';

const levelData = buildLevel(LEVEL_01);

export const EDITOR_DEFAULTS: { data: EditorData, options: EditorOptions } = {
  data: {
    applesMap: {},
    threatsMap: {},
    pickupsMap: {},
    barriersMap: { ...levelData.barriersMap },
    decoratives1Map: { ...levelData.decoratives1Map },
    decoratives2Map: { ...levelData.decoratives2Map },
    doorsMap: { ...levelData.doorsMap },
    keysMap: {},
    locksMap: {},
    nospawnsMap: {},
    passablesMap: {},
    portalsMap: {},
    playerSpawnPosition: levelData.playerSpawnPosition.copy(),
    startDirection: DIR.RIGHT,
    switchesMap: {},
    pipesMap: {},
  },
  options: {
    name: 'Untitled Map',
    timeToClear: 120000,
    applesToClear: 20,
    numApplesStart: 3,
    disableAppleSpawn: false,
    spawnInvincibilityPickups: false,
    spawnMines: false,
    spawnBombs: false,
    spawnBarrels: false,
    spawnLasers: false,
    snakeStartSize: 3,
    growthMod: 1,
    extraHurtGraceTime: 0,
    globalLight: 1,
    palette: PALETTE.hospital,
    portalExitConfig: {
      0: PortalExitMode.SameDirection,
      1: PortalExitMode.SameDirection,
      2: PortalExitMode.SameDirection,
      3: PortalExitMode.SameDirection,
      4: PortalExitMode.SameDirection,
      5: PortalExitMode.SameDirection,
      6: PortalExitMode.SameDirection,
      7: PortalExitMode.SameDirection,
      8: PortalExitMode.SameDirection,
      9: PortalExitMode.SameDirection,
    },
    musicTrack: MusicTrack.None,
    pipeVariant: PipeVariant.Green,
  },
} as const;

export const SKETCH_DEFAULTS = {
  screenShake: {
    offset: new Vector(0, 0),
    timeSinceStarted: 0,
    timeSinceLastStep: 0,
    magnitude: 0,
    timeScale: 0,
  } satisfies ScreenShakeState,
  replay: {
    mode: ReplayMode.Disabled,
    levelIndex: 0,
    levelName: "",
    difficulty: DIFFICULTY_EASY,
    applesToSpawn: [] as [number, number][],
    positions: {},
    timeCaptureStarted: "",
    shouldProceedToNextClip: false,
    lastFrame: 0,
  } satisfies Replay,
  tutorial: {
    needsMoveControls: false,
    needsRewindControls: false,
  } satisfies Tutorial,
  gameState: { ...DEFAULT_GAME_STATE },
};
