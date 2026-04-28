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
import { Pickup, ItemDropType, PortalChannel, PickupType } from "../types";
import { AppleList } from "../collections/appleList";
import { AnimationList } from "../collections/animationList";

const LIGHTMAP_SIZE = (
  GRIDCOUNT_X * Math.floor(LIGHTMAP_RESOLUTION) *
  GRIDCOUNT_Y * Math.floor(LIGHTMAP_RESOLUTION)
);

const lightBuffer = createLightmap();

const TAU = Math.PI * 2;
const NUM_ANGLE_STEPS = 64;
const LIGHT_RADIUS_STEP = 0.5 / LIGHTMAP_RESOLUTION;
const LIGHT_ANGLE_STEP = TAU / NUM_ANGLE_STEPS;

const NUM_UNIQ_LIGHT_COLORS = 1000;
let lightColorLookup: P5.Color[] = [];

const FIRE_FLICKER_CYCLE_MIN = 200;
const FIRE_FLICKER_CYCLE_MAX = 600;
let flickerElapsed = 0;
let flickerDuration = lerp(FIRE_FLICKER_CYCLE_MIN, FIRE_FLICKER_CYCLE_MAX, Math.random());

export function initLighting(p5: P5) {
  lightColorLookup = initLightColorLookup(p5, NUM_UNIQ_LIGHT_COLORS);
}

export function createLightmap(): Float32Array {
  return new Float32Array(LIGHTMAP_SIZE).fill(0);
}

export function resetLightmap(lightMap: Float32Array, globalLight: number) {
  for (let i = 0; i < lightMap.length; i++) {
    lightMap[i] = globalLight;
  }
}

export function updateLighting(
  deltaTime: number,
  lightMap: Float32Array,
  globalLight: number,
  playerPosition: Vector,
  portals: Record<PortalChannel, Vector[]>,
  apples: AppleList | null,
  pickupsMap: Record<number, Pickup> | null,
  explosions: AnimationList | null,
  fireTiles: AnimationList | null,
) {
  resetLightmap(lightMap, globalLight);
  if (globalLight >= 1) return;
  addSpotlight(lightMap, playerPosition.x, playerPosition.y, { radius: 2, falloff: 12 });
  for (let i = 0; i <= 9; i++) {
    for (let j = 0; j < portals[i as PortalChannel].length; j++) {
      const portalPosition = portals[i as PortalChannel][j];
      if (!portalPosition) continue;
      // addBlocklight(lightMap, portalPosition.x, portalPosition.y, { strength: 1 });
      addSpotlight(lightMap, portalPosition.x, portalPosition.y, { strength: 0.5, radius: 0, falloff: 4 });
    }
  }
  for (let i = 0; i < GRIDCOUNT_X * GRIDCOUNT_Y; i++) {
    const isInvincibilityAtCoord = (
      apples?.existsAtCoord(i) &&
      (
        pickupsMap[i]?.type === PickupType.Invincibility ||
        pickupsMap[i]?.type === PickupType.Armor ||
        pickupsMap[i]?.type === PickupType.HealthPack ||
        pickupsMap[i]?.type === PickupType.WeightLossPill
      ) &&
      !shouldBlinkExpiringPickup(pickupsMap[i]?.timeTillDeath)
    );
    if (isInvincibilityAtCoord || explosions?.existsAtCoord(i)) {
      const x = Math.floor(i % GRIDCOUNT_X);
      const y = Math.floor(i / GRIDCOUNT_X);
      addBlocklight(lightMap, x, y, { strength: 0.7 });
      addBlocklight(lightMap, x, y + 1, { strength: 0.3 });
      addBlocklight(lightMap, x, y - 1, { strength: 0.3 });
      addBlocklight(lightMap, x + 1, y, { strength: 0.3 });
      addBlocklight(lightMap, x - 1, y, { strength: 0.3 });
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
        addSpotlight(lightMap, x, y, { strength: lerp(0.35, 0.5, t), radius: lerp(0, 0.25, t), falloff: lerp(2.25, 2.75, t) });
      }
    }
    flickerElapsed += deltaTime;
  }
}

interface LightRect {
  x: number,
  y: number,
  width: number,
  height: number,
  lightIndex: number,
}
const grid = new Uint16Array(LIGHTMAP_SIZE).fill(0);

export function drawLighting(lightMap: Float32Array, renderer: Renderer, gfx: P5 | P5.Graphics) {
  grid.fill(0);
  const coefficient = 1 / LIGHTMAP_RESOLUTION;
  // calculate all light color indexes
  for (let i = 0; i < lightMap.length; i++) {
    const x = i % (GRIDCOUNT_X * LIGHTMAP_RESOLUTION);
    const y = Math.floor(i / (GRIDCOUNT_X * LIGHTMAP_RESOLUTION));
    const a = 1 - clamp(lightMap[i], 0, 1);
    const idx = Math.floor(a * (NUM_UNIQ_LIGHT_COLORS - 1) + Number.EPSILON);
    if (!lightColorLookup[idx]) continue;
    grid[getCoordIndex3(x, y, LIGHTMAP_RESOLUTION)] = idx;
  }
  // perform greedy quad algorithm to get fewest possible number of rects to draw
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
      rects.push({ x, y, width, height, lightIndex: idx } satisfies LightRect);
    }
  }
  // finally, draw the result rects
  for (let i = 0; i < rects.length; i++) {
    const { x, y, width, height, lightIndex } = rects[i]
    const color = lightColorLookup[lightIndex];
    if (!color) continue;
    renderer.drawBasicRect(gfx, x * coefficient, y * coefficient, width * coefficient, height * coefficient, color);
  }
}


interface AddSpotlightOptions {
  radius?: number,
  falloff?: number,
  strength?: number,
}
function addSpotlight(lightMap: Float32Array, x: number, y: number, {
  radius = 1,
  falloff = 2,
  strength = 1,
}: AddSpotlightOptions = {}) {
  resetLightmap(lightBuffer, 0);
  // iterate over grid at extents of radius + falloff
  let extent = Math.ceil((radius + falloff) * LIGHTMAP_RESOLUTION);
  // force extend to be an odd number so that our spotlight is perfectly centered
  if (extent % 2 === 0) extent += 1;
  for (let dx = -extent; dx <= extent; dx++) {
    for (let dy = -extent; dy <= extent; dy++) {
      const lx = x * LIGHTMAP_RESOLUTION + dx;
      const ly = y * LIGHTMAP_RESOLUTION + dy;
      const r = Math.hypot(dx, dy);
      const i = toQuantizedIndex(lx, ly);
      if (inBounds(lx, ly) && lightBuffer[i] === 0) {
        lightBuffer[i] = getSpotlightValue(r / LIGHTMAP_RESOLUTION, radius, falloff) * strength;
      }
    }
  }
  commitStagedLight(lightBuffer, lightMap);
}

function inBounds(lx: number, ly: number): boolean {
  return true
    && lx >= 0 && lx < GRIDCOUNT_X * LIGHTMAP_RESOLUTION
    && ly >= 0 && ly < GRIDCOUNT_Y * LIGHTMAP_RESOLUTION;
}

interface AddBlocklightOptions {
  strength?: number,
}
function addBlocklight(lightMap: Float32Array, x: number, y: number, {
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

function initLightColorLookup(p5: P5, size: number) {
  const lookup: P5.Color[] = []
  for (let i = 0; i < size; i++) {
    const a = i / (size - 1);
    const color = Color("#013").alpha(a);
    lookup.push(p5.color(color.hexa()));
    // // // DEBUG SHADOW COLORS
    // const r = lerp(0, 255, Math.random());
    // const g = lerp(0, 255, Math.random());
    // const b = lerp(0, 255, Math.random());
    // const color = p5.color(r, g, b, lerp(0, 255, 0.5))
    // lookup.push(color);
  }
  return lookup;
}
