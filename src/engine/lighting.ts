import P5, { Vector } from "p5";
import Color from "color";

import {
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  LIGHTMAP_RESOLUTION,
} from "../constants";
import { Renderer } from "./renderer";
import { clamp, getCoordIndex3, lerp, shouldBlinkExpiringPickup } from "../utils";
import { Easing } from "../easing";
import { Pickup, PortalChannel, PickupType, EngineState, GameState, ThreatType, LightPalette, LightSource, LightType } from "../types";
import { AnimationList } from "../collections/animationList";
import { DEFAULT_ENGINE_STATE, DEFAULT_GAME_STATE } from "@/defaults";
import { ExtendedSketchData } from "@/editor/editorSketch";

const LIGHTMAP_SIZE = (
  GRIDCOUNT_X * Math.floor(LIGHTMAP_RESOLUTION) *
  GRIDCOUNT_Y * Math.floor(LIGHTMAP_RESOLUTION)
);

let p5: P5;
const buffer = createLightmap();
const lightMap: Float32Array = createLightmap();

const LIGHT_PALETTES: Record<LightPalette, string[]> = {
  [LightPalette.None]: [],
  [LightPalette.AmberViolet]: [
    '#242b4a',
    '#52216e',
    '#911d55',
    '#bf2651',
    '#f54f4f',
    '#ff8766',
    '#ffac7f',
    '#ffd3a3',
    '#fafac3',
  ]
} satisfies Record<LightPalette, string[]>;

const NUM_UNIQ_DARKNESS_COLORS = 1000;
let darknessColorLookup: P5.Color[];

const FIRE_FLICKER_CYCLE_MIN = 200;
const FIRE_FLICKER_CYCLE_MAX = 600;
let flickerElapsed = 0;
let flickerDuration = lerp(FIRE_FLICKER_CYCLE_MIN, FIRE_FLICKER_CYCLE_MAX, Math.random());

export function initLighting(_p5: P5) {
  p5 = _p5;
  darknessColorLookup = initDarknessColorLookup(NUM_UNIQ_DARKNESS_COLORS, LightPalette.AmberViolet);
}

export function createLightmap(): Float32Array {
  return new Float32Array(LIGHTMAP_SIZE).fill(0);
}

export function initLightmap(globalLight: number, palette: LightPalette) {
  resetLightmap(lightMap, globalLight);
  darknessColorLookup = initDarknessColorLookup(NUM_UNIQ_DARKNESS_COLORS, palette || LightPalette.AmberViolet);
}

function resetLightmap(lmap: Float32Array, initialValue: number) {
  for (let i = 0; i < lmap.length; i++) {
    lmap[i] = initialValue;
  }
}

export function updateLighting(
  deltaTime: number,
  globalLight: number,
  playerPosition: Vector,
  portals: Record<PortalChannel, Vector[]>,
  pickupsMap: Record<number, Pickup> | null,
  explosions: AnimationList | null,
  fireTiles: AnimationList | null,
  gameState: GameState,
  es: EngineState | ExtendedSketchData,
  elapsed: number,
) {
  if (!gameState) gameState = DEFAULT_GAME_STATE;
  if (!es) es = DEFAULT_ENGINE_STATE;
  resetLightmap(lightMap, globalLight);
  if (globalLight >= 1) return;
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    const val = es.illuminationMap[coord];
    if (val) {
      const x = Math.floor(coord % GRIDCOUNT_X);
      const y = Math.floor(coord / GRIDCOUNT_X);
      addBlocklight(x, y, { strength: 1 * val });
      addPointlight(x, y, { strength: 0.35 * val, radius: 1, falloff: 4 });
    }
  }
  // spike death, trapped, etc.
  if (gameState.isDeathIlluminating) {
    return;
  };
  addPointlight(playerPosition.x, playerPosition.y, { radius: 2, falloff: 12 });
  for (let i = 0; i <= 9; i++) {
    for (let j = 0; j < portals[i as PortalChannel].length; j++) {
      const portalPosition = portals[i as PortalChannel][j];
      if (!portalPosition) continue;
      // addBlocklight(portalPosition.x, portalPosition.y, { strength: 1 });
      addPointlight(portalPosition.x, portalPosition.y, { strength: 0.5, radius: 0, falloff: 4 });
    }
  }
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    const isLaserAtCoord = es.lasersMap[coord] || es.threatsMap[coord] === ThreatType.ElectricCoil;
    const isFireAtCoord = es.flamesMap[coord] && !gameState.isButtonPressed;
    const isExitAtCoord = (
      gameState.isDoorsOpen
      && !gameState.isExitingLevel
      && !gameState.isExited
      && ((x === 0 || y === 0 || x === GRIDCOUNT_X - 1 || y === GRIDCOUNT_Y - 1))
      && (!es.barriersMap[coord] || es.passablesMap[coord])
      && !es.portalsMap[coord]
      && (!es.nospawnsMap[coord] || es.locksMap[coord])
    );
    const isPickupAtCoord = (
      pickupsMap &&
      (
        pickupsMap[coord]?.type === PickupType.Invincibility ||
        pickupsMap[coord]?.type === PickupType.Armor ||
        pickupsMap[coord]?.type === PickupType.HealthPack ||
        pickupsMap[coord]?.type === PickupType.WeightLossPill
      ) &&
      !shouldBlinkExpiringPickup(pickupsMap[coord]?.lifetime)
    );
    if (isExitAtCoord || isPickupAtCoord || isLaserAtCoord || isFireAtCoord || explosions?.existsAtCoord(coord)) {
      addBlocklight(x, y, { strength: 0.7 });
      addBlocklight(x, y + 1, { strength: 0.3 });
      addBlocklight(x, y - 1, { strength: 0.3 });
      addBlocklight(x + 1, y, { strength: 0.3 });
      addBlocklight(x - 1, y, { strength: 0.3 });
    }
    if (gameState.lightsOn &&  es.lightSources[coord]) {
      const source = es.lightSources[coord];
      switch (source.type) {
        case LightType.Point:
          addPointlight(x, y, { strength: source.strength, radius: source.radius, falloff: source.falloff });
          break;
        case LightType.DirectionalSpotlight:
          addDirectionalSpotlight(x, y, source, elapsed);
          break;
      }
    }
  }
  if (fireTiles) {
    for (let i = 0; i < GRIDCOUNT_X * GRIDCOUNT_Y; i++) {
      if (fireTiles.existsAtCoord(i)) {
        const x = Math.floor(i % GRIDCOUNT_X);
        const y = Math.floor(i / GRIDCOUNT_X);
        // simulate a flicker effect
        if (flickerElapsed >= flickerDuration) {
          flickerElapsed = 0;
          flickerDuration = lerp(FIRE_FLICKER_CYCLE_MIN, FIRE_FLICKER_CYCLE_MAX, Math.random());
        }
        const t = Math.sin((flickerElapsed / flickerDuration) * Math.PI)
        addPointlight(x, y, { strength: lerp(0.35, 0.5, t), radius: lerp(0, 0.25, t), falloff: lerp(2.25, 2.75, t) });
      }
    }
    flickerElapsed += deltaTime;
  }
  elapsed += deltaTime;
}

interface LightRect {
  x: number,
  y: number,
  coord: number,
  width: number,
  height: number,
  lightIndex: number,
}
const dgrid = new Uint16Array(LIGHTMAP_SIZE).fill(0);

export function drawLighting(renderer: Renderer, gfx: P5 | P5.Graphics) {
  if (!darknessColorLookup) return;
  dgrid.fill(0);
  const coefficient = 1 / LIGHTMAP_RESOLUTION;
  // calculate all darkness color indexes
  for (let i = 0; i < lightMap.length; i++) {
    const x = i % (GRIDCOUNT_X * LIGHTMAP_RESOLUTION);
    const y = Math.floor(i / (GRIDCOUNT_X * LIGHTMAP_RESOLUTION));
    const a = 1 - clamp(lightMap[i], 0, 1);
    const idx = Math.floor(a * (NUM_UNIQ_DARKNESS_COLORS - 1) + Number.EPSILON);
    if (!darknessColorLookup[idx]) continue;
    dgrid[getCoordIndex3(x, y, LIGHTMAP_RESOLUTION)] = idx;
  }
  // draw darkness rects
  const darknessRects = getLightRects(dgrid);
  for (let i = 0; i < darknessRects.length; i++) {
    const { x, y, width, height, lightIndex } = darknessRects[i]
    const color = darknessColorLookup[lightIndex];
    if (!color) continue;
    renderer.drawBasicRect(gfx, x * coefficient, y * coefficient, width * coefficient, height * coefficient, color);
  }
}

// perform greedy quad algorithm to get fewest possible number of rects to draw
function getLightRects(grid: Uint16Array) {
  const rects: LightRect[] = []
  const consumed: Record<number, boolean> = {};
  const cols = GRIDCOUNT_X * LIGHTMAP_RESOLUTION;
  const rows = GRIDCOUNT_Y * LIGHTMAP_RESOLUTION;
  const r = LIGHTMAP_RESOLUTION;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (consumed[getCoordIndex3(x, y, r)]) {
        continue;
      }
      let width = 1;
      let height = 1;
      const idx = grid[getCoordIndex3(x, y, r)];
      // greedy expand horizontally
      while (
        x + width < cols &&
        grid[getCoordIndex3(x + width, y, r)] === idx &&
        !consumed[getCoordIndex3(x + width, y, r)]
      ) {
        width++;
      }
      // greedy expand vertically
      let canExpandHeight = true;
      while (y + height < rows && canExpandHeight) {
        for (let i = 0; i < width; i++) {
          const coord = getCoordIndex3(x + i, y + height, r);
          if (
            grid[coord] !== idx ||
            consumed[coord]
          ) {
            canExpandHeight = false;
            break;
          }
        }
        if (canExpandHeight) height++;
      }
      // mark cells consumed
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          consumed[getCoordIndex3(x + j, y + i, r)] = true;
        }
      }
      rects.push({ x, y, coord: getCoordIndex3(x, y, r), width, height, lightIndex: idx } satisfies LightRect);
    }
  }
  return rects;
}


interface AddSpotlightOptions {
  radius?: number,
  falloff?: number,
  strength?: number,
}
function addPointlight(x: number, y: number, opts: AddSpotlightOptions = {}) {
  const {
    radius = 1,
    falloff = 2,
    strength = 1,
  } = opts;
  resetLightmap(buffer, 0);
  // iterate over grid at extents of radius + falloff
  let extent = Math.ceil((radius + falloff) * LIGHTMAP_RESOLUTION);
  // force extend to be an odd number so that our spotlight is perfectly centered
  if (extent % 2 === 0) extent += 1;
  for (let dx = -extent; dx <= extent; dx++) {
    for (let dy = -extent; dy <= extent; dy++) {
      const lx = x * LIGHTMAP_RESOLUTION + dx;
      const ly = y * LIGHTMAP_RESOLUTION + dy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const i = toQuantizedIndex(lx, ly);
      if (inBounds(lx, ly) && buffer[i] === 0) {
        buffer[i] = getSpotlightValue(r / LIGHTMAP_RESOLUTION, radius, falloff) * strength;
      }
    }
  }
  commitStagedLight(buffer, lightMap);
}

interface AddBlocklightOptions {
  strength?: number,
}
function addBlocklight(x: number, y: number, {
  strength = 1,
}: AddBlocklightOptions) {
  const lx = x * LIGHTMAP_RESOLUTION;
  const ly = y * LIGHTMAP_RESOLUTION;
  const i = toQuantizedIndex(lx, ly);
  lightMap[i] += strength;
}

function getSpotlightValue(distanceFromOrigin: number, radius: number, falloff: number): number {
  radius = Math.max(radius, 0);
  falloff = Math.max(falloff, 0);
  if (distanceFromOrigin >= radius + falloff) return 0;
  if (distanceFromOrigin <= radius) return 1;
  return Easing.inQuad(lerp(1, 0, (distanceFromOrigin - radius) / falloff));
}

function commitStagedLight(source: Float32Array, target: Float32Array) {
  for (let i = 0; i < target.length && i < source.length; i++) {
    target[i] += source[i];
  }
}

function toQuantizedIndex(x: number, y: number): number {
  return Math.floor(
    clamp(Math.round(x), 0, GRIDCOUNT_X * LIGHTMAP_RESOLUTION - 1) +
    clamp(Math.round(y), 0, GRIDCOUNT_Y * LIGHTMAP_RESOLUTION - 1) * GRIDCOUNT_X * LIGHTMAP_RESOLUTION
  );
}

function addDirectionalSpotlight(x: number, y: number, source: LightSource, elapsed: number) {
  addBlocklight(x, y, { strength: lerp(source.strength + 0.5, 0, source.strength) });
  resetLightmap(buffer, 0);
  let dirx = 0;
  let diry = 0;
  let spanx = 0;
  let spany = 0;
  const t = Math.floor(elapsed / 250) % 4;
  switch (t) {
    case 0:
      dirx = 1;
      spany = 1;
      break;
    case 1:
      diry = 1;
      spanx = 1;
      break;
    case 2:
      dirx = -1
      spany = 1;
      break;
    case 3:
      diry = -1;
      spanx = 1;
      break;
  }
  if (!dirx && !diry) return;
  const radius = source.radius;
  const falloff = source.falloff;
  const strength = source.strength;
  // iterate over grid at extents of radius + falloff
  let extent = Math.ceil((radius + falloff) * LIGHTMAP_RESOLUTION);
  // force extend to be an odd number so that our spotlight is perfectly centered
  if (extent % 2 === 0) extent += 1;

  for (let ext = 0; ext <= extent; ext++) {
    for (let span = -1 * ext; span <= ext; span++) {
      const dx = dirx * ext + spanx * span;
      const dy = diry * ext + spany * span;
      const lx = x * LIGHTMAP_RESOLUTION + dx;
      const ly = y * LIGHTMAP_RESOLUTION + dy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const i = toQuantizedIndex(lx, ly);
      if (inBounds(lx, ly) && buffer[i] === 0) {
        buffer[i] = getSpotlightValue(r / LIGHTMAP_RESOLUTION, radius, falloff) * strength;
      }
    }
  }
  commitStagedLight(buffer, lightMap);
}

function initDarknessColorLookup(size: number, palette: LightPalette) {
  if (!p5) throw new Error('p5 not initialized! make sure you call initLighting() first.');
  const lookup: P5.Color[] = []
  for (let i = 0; i < size; i++) {
    const a = i / (size - 1);
    const v = Easing.inCubic(1 - a);
    const idx = Math.floor(v * (LIGHT_PALETTES[palette].length - 0.01));
    const dark = "#013";
    const color1 = Color(dark).alpha(a);
    const color2 = Color(LIGHT_PALETTES[palette][idx] || dark).alpha(a);
    const color = color1.mix(color2, v * 0.5);
    lookup.push(p5.color(color.hexa()));
    // // DEBUG SHADOW COLORS
    // const r = lerp(0, 255, Math.random());
    // const g = lerp(0, 255, Math.random());
    // const b = lerp(0, 255, Math.random());
    // const color = p5.color(r, g, b, lerp(0, 255, 0.5))
    // lookup.push(color);
  }
  return lookup;
}

function inBounds(lx: number, ly: number): boolean {
  return true
    && lx >= 0 && lx < GRIDCOUNT_X * LIGHTMAP_RESOLUTION
    && ly >= 0 && ly < GRIDCOUNT_Y * LIGHTMAP_RESOLUTION;
}
