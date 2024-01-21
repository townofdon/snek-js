import P5, { Vector } from "p5";
import Color from "color";

import { GRIDCOUNT, LIGHTMAP_RESOLUTION } from "./constants";
import { Renderer } from "./renderer";
import { clamp, lerp } from "./utils";
import { Easing } from "./easing";
import { PortalChannel } from "./types";

const lightBuffer = createLightmap();

const TAU = Math.PI * 2;
const NUM_ANGLE_STEPS = 64;
const LIGHT_RADIUS_STEP = 0.5;
const LIGHT_ANGLE_STEP = TAU / NUM_ANGLE_STEPS;

const numUniqLightColors = 1000;
let lightColorLookup: P5.Color[] = [];

export function initLighting(p5: P5) {
  lightColorLookup = initLightColorLookup(p5, numUniqLightColors);
}

export function createLightmap(): number[] {
  return new Array<number>(
    GRIDCOUNT.x * Math.floor(LIGHTMAP_RESOLUTION) *
    GRIDCOUNT.y * Math.floor(LIGHTMAP_RESOLUTION)
  );
}

export function resetLightmap(lightMap: number[], globalLight: number) {
  for (let i = 0; i < lightMap.length; i++) {
    lightMap[i] = globalLight;
  }
}

export function updateLighting(lightMap: number[], globalLight: number, playerPosition: Vector, portals: Record<PortalChannel, Vector[]>) {
  resetLightmap(lightMap, globalLight);
  addSpotlight(lightMap, playerPosition.x, playerPosition.y, { radius: 2, falloff: 12 });
  for (let i = 0; i <= 9; i++) {
    for (let j = 0; j < portals[i as PortalChannel].length; j++) {
      const portalPosition = portals[i as PortalChannel][j];
      if (!portalPosition) continue;
      // addBlocklight(lightMap, portalPosition.x, portalPosition.y, { strength: 1 });
      addSpotlight(lightMap, portalPosition.x, portalPosition.y, { strength: 0.5, radius: 0, falloff: 4 });
    }
  }
}

export function drawLighting(lightMap: number[], renderer: Renderer) {
  for (let i = 0; i < lightMap.length; i++) {
    const x = i % (GRIDCOUNT.x * LIGHTMAP_RESOLUTION);
    const y = Math.floor(i / (GRIDCOUNT.x * LIGHTMAP_RESOLUTION));
    const a = 1 - clamp(lightMap[i], 0, 1);
    const color = lightColorLookup[Math.floor(a * numUniqLightColors + Number.EPSILON)];
    if (!color) continue;
    const coefficient = 1 / LIGHTMAP_RESOLUTION;
    renderer.drawBasicSquare(x * coefficient, y * coefficient, color, coefficient);
  }
}

interface AddSpotlightOptions {
  radius?: number,
  falloff?: number,
  strength?: number,
}
function addSpotlight(lightMap: number[], x: number, y: number, {
  radius = 1,
  falloff = 2,
  strength = 1,
}: AddSpotlightOptions = {}) {
  resetLightmap(lightBuffer, 0);

  // iterate outwards, drawing circles of light to staging buffer
  let r = 0;
  while (r <= (radius + falloff) * LIGHTMAP_RESOLUTION) {
    let angle = 0;
    while (angle < TAU) {
      const lx = x * LIGHTMAP_RESOLUTION + Math.round(Math.cos(angle) * r * LIGHTMAP_RESOLUTION);
      const ly = y * LIGHTMAP_RESOLUTION + Math.round(Math.sin(angle) * r * LIGHTMAP_RESOLUTION);
      const i = toQuantizedIndex(lx, ly);
      // don't draw here if buffer already has a value
      if (inBounds(lx, ly) && lightBuffer[i] === 0) {
        lightBuffer[i] = getSpotlightValue(r, radius, falloff) * strength;
      }
      if (r < 2) {
        angle += LIGHT_ANGLE_STEP * 16;
      } else if (r < 4) {
        angle += LIGHT_ANGLE_STEP * 4;
      } else if (r < 5) {
        angle += LIGHT_ANGLE_STEP * 2;
      } else {
        angle += LIGHT_ANGLE_STEP;
      }
    }
    if (r <= 5) {
      r += 1;
    } else {
      r += LIGHT_RADIUS_STEP;
    }
  }
  commitStagedLight(lightBuffer, lightMap);
}

function inBounds(lx: number, ly: number): boolean {
  return true
    && lx >= 0 && lx < GRIDCOUNT.x * LIGHTMAP_RESOLUTION
    && ly >= 0 && ly < GRIDCOUNT.y * LIGHTMAP_RESOLUTION;
}

interface AddBlocklightOptions {
  strength?: number,
}
function addBlocklight(lightMap: number[], x: number, y: number, {
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

function commitStagedLight(source: number[], target: number[]) {
  for (let i = 0; i < target.length && i < source.length; i++) {
    target[i] += source[i];
  }
}

function toQuantizedIndex(x: number, y: number): number {
  return Math.floor(
    clamp(Math.round(x), 0, GRIDCOUNT.x * LIGHTMAP_RESOLUTION - 1) +
    clamp(Math.round(y), 0, GRIDCOUNT.y * LIGHTMAP_RESOLUTION - 1) * GRIDCOUNT.x * LIGHTMAP_RESOLUTION
  );
}

function initLightColorLookup(p5: P5, size: number) {
  const lookup: P5.Color[] = []
  for (let i = 0; i < size; i++) {
    const a = i / (size - 1);
    const color = Color("#013").alpha(a);
    lookup.push(p5.color(color.hexa()));
  }
  return lookup;
}
