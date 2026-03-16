import { GRIDCOUNT, IS_DEV } from "../constants";
import { getCoordIndex2, getTraversalDistance } from "../utils";
import { AnimationList } from "./animationList";

const THREAT_COST_MINE = 4;
const THREAT_COST_SNEK = 6;
const DIAG_COST = 1.41421;
const FLAG_WALL = 1;
const FLAG_CLOSED = 2;
const FLAG_VISITED = 4;

export const ASTAR_GRID_SIZE = GRIDCOUNT.x * GRIDCOUNT.y;

interface AStarOptions {
  allowDiagonals: boolean,
  allowClosest: boolean,
  mines?: AnimationList,
}

const DEFAULT_OPTIONS = {
  allowDiagonals: false,
  allowClosest: false,
} satisfies AStarOptions;

/**
 * Non-allocating A-Star search algorithm.
 * Uses a Binary Heap internally for performance.
 */
export class AStar {
  private options: AStarOptions;

  // binary heap that keeps track of indices on the open list. mapping: index => coord
  private openList: Uint16Array;
  // keeps track of list length, since lists are always filled to capacity
  private openListLength: number;

  // maps node (coord) to its parent node (coord)
  private parent: Int16Array;

  // track states: closed, visited, etc.
  private flags: Uint8Array;

  // g score lookup for coord
  private gScore: Float32Array;

  // h score lookup for coord
  private hScore: Float32Array;

  // result of a-star search()
  private path: Uint16Array;
  private pathLength: number;
  private pathCost: number;

  // threats
  private mines: AnimationList;
  private snekCoord: number;

  private closest: number;

  constructor(_options?: Partial<AStarOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ..._options};
    this.mines = _options?.mines;

    this.openList = new Uint16Array(ASTAR_GRID_SIZE);
    this.openListLength = 0;
    this.parent = new Int16Array(ASTAR_GRID_SIZE);
    this.flags = new Uint8Array(ASTAR_GRID_SIZE);
    this.gScore = new Float32Array(ASTAR_GRID_SIZE);
    this.hScore = new Float32Array(ASTAR_GRID_SIZE);
    this.path = new Uint16Array(ASTAR_GRID_SIZE);
    this.pathLength = 0;
    this.pathCost = 0;
    this.reset();
  }

  public reset() {
    this.validate();
    this.openList.fill(0);
    this.parent.fill(-1);
    this.flags.fill(0);
    this.gScore.fill(0);
    this.hScore.fill(0);
    this.path.fill(0);
    this.openListLength = 0;
    this.pathLength = 0;
    this.pathCost = 0;
    this.closest = -1;
    this.snekCoord = -1;
  }

  public setSnekCoord(coord: number) {
    this.snekCoord = coord;
  }

  public setWall(x: number, y: number) {
    this.flags[getCoordIndex2(x, y)] |= FLAG_WALL;
  }

  public setWallByCoord(coord: number) {
    this.flags[coord] |= FLAG_WALL;
  }

  public getPath() {
    const latest: number[] = new Array(this.pathLength).fill(0);
    for (let i = 0; i < this.pathLength; i++) {
      latest[i] = this.path[i];
    }
    return latest;
  }

  public search(startx: number, starty: number, endx: number, endy: number): boolean {
    const allowClosest = this.options.allowClosest;
    const allowDiagonals = this.options.allowDiagonals;
    const startCoord = getCoordIndex2(startx, starty);
    const endCoord = getCoordIndex2(endx, endy);
    for (let i = 0; i < ASTAR_GRID_SIZE; i++) {
      this.gScore[i] = 0;
      this.hScore[i] = 0;
      this.flags[i] &= ~FLAG_CLOSED;
      this.flags[i] &= ~FLAG_VISITED;
      this.parent[i] = -1;
    }
    this.openListLength = 0;
    this.closest = -1;

    const snekx = Math.floor(this.snekCoord % GRIDCOUNT.x);
    const sneky = Math.floor(this.snekCoord / GRIDCOUNT.x);
    const snekCoord = this.snekCoord;
    const flags = this.flags;
    const parents = this.parent;
    const gScores = this.gScore;
    const hScores = this.hScore;
    const mines = this.mines;

    this.hScore[0] = getTraversalDistance(startx, starty, endx, endy);
    this.addToOpenList(startCoord, gScores, hScores);

    while (this.openListLength > 0) {
      const current = this.extractMinFromOpenList(gScores, hScores);
      if (current < 0) break;

      flags[current] |= FLAG_CLOSED;

      // build path if we have arrived at the target
      if (current === endCoord) {
        this.pathCost = gScores[current] + hScores[current];
        this.constructPath(current);
        return true;
      }

      const x = Math.floor(current % GRIDCOUNT.x);
      const y = Math.floor(current / GRIDCOUNT.x);
      const okleft = x > 0;
      const okright = x < GRIDCOUNT.x - 1;
      const okup = y > 0;
      const okdown = y < GRIDCOUNT.y - 1;
      const left = okleft ? getCoordIndex2(x - 1, y) : -1;
      const right = okright ? getCoordIndex2(x + 1, y) : -1;
      const up = okup ? getCoordIndex2(x, y - 1) : -1;
      const down = okdown ? getCoordIndex2(x, y + 1) : -1;
      const upleft = (okup && okleft) ? getCoordIndex2(x - 1, y - 1) : -1;
      const upright = (okup && okright) ? getCoordIndex2(x + 1, y - 1) : -1;
      const downleft = (okdown && okleft) ? getCoordIndex2(x - 1, y + 1) : -1;
      const downright = (okdown && okright) ? getCoordIndex2(x + 1, y + 1) : -1;
      const numNeighbors = allowDiagonals ? 8 : 4

      // check neighbors
      for (let idx = 0; idx < numNeighbors; idx++) {
        let neighbor = -1;
        if (idx === 0) neighbor = left;
        if (idx === 1) neighbor = right;
        if (idx === 2) neighbor = up;
        if (idx === 3) neighbor = down;
        if (idx === 4) neighbor = upleft;
        if (idx === 5) neighbor = upright;
        if (idx === 6) neighbor = downleft;
        if (idx === 7) neighbor = downright;
        if (neighbor < 0) {
          continue;
        }
        const isWall = !!(flags[neighbor] & FLAG_WALL);
        const isClosed = !!(flags[neighbor] & FLAG_CLOSED);
        const isVisited = !!(flags[neighbor] & FLAG_VISITED);
        if (isClosed || isWall) {
          continue;
        }
        const nx = Math.floor(neighbor % GRIDCOUNT.x);
        const ny = Math.floor(neighbor / GRIDCOUNT.x);
        // calculate threat costs
        const distToClosestMine = mines?.getClosestTraversalDistance(nx, ny) ?? Infinity;
        const distToSnekHead = (() => {
          if (snekCoord < 0) return Infinity;
          return getTraversalDistance(nx, ny, snekx, sneky);
        })()
        const isDiagonal = idx >= 4;
        const diagCostMultiplier = isDiagonal ? DIAG_COST : 1;
        // see: https://www.desmos.com/calculator/w2r2szwtmz
        const threatCostMine = distToClosestMine <= 2
          ? (THREAT_COST_MINE / (distToClosestMine + 1)) || 0
          : 0;
        const threatCostSnek = distToSnekHead <= 5
          ? (THREAT_COST_SNEK / (distToSnekHead + 1)) || 0
          : 0;
        const threatCost = Math.max(
          threatCostMine,
          threatCostSnek,
        );
        // calculate traversal cost (g)
        const gScore = gScores[current]
          + diagCostMultiplier
          + threatCost;
        // set neighbor fields, add to open list
        if (!isVisited || gScore < gScores[neighbor]) {
          const hScore = getTraversalDistance(nx, ny, endx, endy);
          flags[neighbor] |= FLAG_VISITED;
          parents[neighbor] = current;
          gScores[neighbor] = gScore;
          hScores[neighbor] = hScore;
          // set closest node
          const closest = this.closest;
          if (
            allowClosest && (
              closest < 0 ||
              hScores[neighbor] < hScores[closest] ||
              (hScores[neighbor] === hScores[closest] && gScores[neighbor] < gScores[closest])
            )
          ){
            this.closest = neighbor;
          }
          if (!isVisited) {
            this.addToOpenList(neighbor, gScores, hScores);
          } else {
            this.bhRescoreElement(neighbor, gScores, hScores);
          }
        }
      }
    }

    // build path to closest node if it exists
    if (allowClosest && this.closest >= 0) {
      const current = this.closest;
      this.pathCost = gScores[current] + hScores[current];
      this.constructPath(current);
      return true;
    }

    return false;
  }

  private constructPath(coord: number) {
    let current = coord;
    const newpath: number[] = [current];
    while (this.parent[current] > -1) {
      newpath.unshift(this.parent[current]);
      current = this.parent[current];
    }
    this.pathLength = newpath.length;
    newpath.forEach((coord, i) => {
      this.path[i] = coord;
    });
  }

  private validate() {
    if (IS_DEV) {
      type ValidationTest = [ArrayLike<any>, ArrayLike<any>, string];
      const tests: ValidationTest[] = [
        [this.openList, this.parent, "openList, parent"],
        [this.openList, this.flags, "openList, flags"],
        [this.openList, this.gScore, "openList, gScore"],
        [this.openList, this.hScore, "openList, hScore"],
        [this.openList, this.path, "openList, path"],
      ];
      tests.forEach(([a, b, text]) => {
        if (a.length !== b.length) {
          throw new Error(
            `[AStar] Validation Error: list lengths do not match! [${text}], a.length=${a.length},b.length=${b.length}`,
          );
        }
      });
    }
  }

  public debugPrint() {
    for (let y = 0; y < GRIDCOUNT.y; y++) {
      let str = "";
      for (let x = 0; x < GRIDCOUNT.x; x++) {
        const coord = getCoordIndex2(x, y);
        const isWall = !!(this.flags[coord] & FLAG_WALL);
        const isSnekThreat = coord === this.snekCoord;
        const isMineThreat = this.mines?.existsAtCoord(coord) || false;
        const isPathNode = (() => {
          for (let i = 0; i < this.pathLength; i++) {
            if (this.path[i] === coord) return true;
          }
          return false;
        })()
        const isStart = this.pathLength > 0 && coord === this.path[0];
        const isEnd = this.pathLength > 0 && coord === this.path[this.pathLength - 1];
        const char = (() => {
          if (isStart) return '@';
          if (isEnd) return '+';
          if (isWall && isPathNode) return '!';
          if (isWall) return 'X';
          if (isSnekThreat) return 'S';
          if (isMineThreat) return '*';
          if (isPathNode) return 'o'
          return '_';
        })()
        str += char;
      }
      console.log(str);
    }
  }


  //
  // Binary Heap Functions
  //

  private addToOpenList(coord: number, gScore: Float32Array, hScore: Float32Array) {
    const i = this.openListLength;
    this.openList[i] = coord;
    this.openListLength++;
    this.bhSinkDown(i, gScore, hScore);
  }

  private extractMinFromOpenList(gScore: Float32Array, hScore: Float32Array) {
    if (this.openListLength === 0) {
      return -1;
    }
    const result = this.openList[0];
    const end = this.openList[this.openListLength - 1];
    this.openListLength--;
    if (this.openListLength > 0) {
      this.openList[0] = end;
      this.bhBubbleUp(0, gScore, hScore);
    }
    return result;
  }

  private bhRescoreElement(coord: number, gScore: Float32Array, hScore: Float32Array) {
    const i = this.openList.indexOf(coord);
    if (i > -1) {
      const j = this.bhSinkDown(i, gScore, hScore);
      this.bhBubbleUp(j, gScore, hScore);
    }
  }

  private bhSinkDown(_index: number, gScore: Float32Array, hScore: Float32Array) {
    const openList = this.openList;
    const coord = openList[_index];
    let i = _index;
    let escapeHatch = 0;
    while (i > 0 && escapeHatch < 1000) {
      escapeHatch++;
      const parentIndex = (i - 1) >> 1; // floor((i - 1) / 2)
      const parentCoord = openList[parentIndex];
      const fScoreCurrent = gScore[coord] + hScore[coord];
      const fScoreParent = gScore[parentCoord] + hScore[parentCoord];
      if (fScoreCurrent < fScoreParent) {
        openList[parentIndex] = coord;
        openList[i] = parentCoord;
        i = parentIndex;
      } else {
        return i;
      }
    }
    if (i > 0) {
      throw new Error(`Infinite loop averted! Looped ${escapeHatch} times before stopping.`);
    }
    return 0;
  }

  private bhBubbleUp(_index: number, gScore: Float32Array, hScore: Float32Array) {
    const openList = this.openList;
    const length = this.openListLength;
    const coord = openList[_index];
    const fScoreOriginal = gScore[coord] + hScore[coord];
    let fScoreLeft = 0;
    let i = _index;
    let escapeHatch = 0;
    while (escapeHatch < 1000) {
      escapeHatch++;
      const left = (i << 1) + 1; // 2i + 1
      const right = (i << 1) + 2; // 2i + 2
      let swap = 0;
      if (left < length) {
        const leftCoord = openList[left];
        fScoreLeft = gScore[leftCoord] + hScore[leftCoord];
        if (fScoreLeft < fScoreOriginal) {
          swap = left;
        }
      }
      if (right < length) {
        const rightCoord = openList[right];
        const fScoreRight = gScore[rightCoord] + hScore[rightCoord];
        if (fScoreRight < (swap ? fScoreLeft : fScoreOriginal)) {
          swap = right;
        }
      }
      if (swap > 0) {
        openList[i] = openList[swap];
        openList[swap] = coord;
        i = swap;
      } else {
        return i;
      }
    }
    throw new Error(`Infinite loop averted! Looped ${escapeHatch} times before stopping.`);
  }

  public test__addToOpenList(coord: number) {
    this.addToOpenList(coord, this.gScore, this.hScore);
  }

  public test__extractMinFromOpenList() {
    return this.extractMinFromOpenList(this.gScore, this.hScore);
  }

  public test__bhSinkDown(index: number) {
    return this.bhSinkDown(index, this.gScore, this.hScore);
  }

  public test__bhBubbleUp(index: number) {
    return this.bhBubbleUp(index, this.gScore, this.hScore);
  }

  public test__bhRescoreElement(index: number) {
    return this.bhRescoreElement(index, this.gScore, this.hScore);
  }

  public test__setOpenListData(openListData: number[]) {
    openListData.forEach((num, i) => {
      this.openList[i] = num;
    });
    this.openListLength = openListData.length;
  }

  public test__setScores(gScore: Record<number, number>, hScore: Record<number, number>) {
    Object.entries(gScore).forEach(([coord, score]) => {
      this.gScore[parseInt(coord, 10)] = score;
    });
    Object.entries(hScore).forEach(([coord, score]) => {
      this.hScore[parseInt(coord, 10)] = score;
    });
  }

  public test__getOpenListData() {
    const openList = new Array(this.openListLength);
    for (let i = 0; i < this.openListLength; i++) {
      openList[i] = this.openList[i];
    }
    return openList;
  }
}
