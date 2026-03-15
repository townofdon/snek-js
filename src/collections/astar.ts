import { GRIDCOUNT, IS_DEV } from "../constants";
import { getCoordIndex2, getTraversalDistance } from "../utils";
import { AnimationList } from "./animationList";

export const ASTAR_WALL = Infinity;
const THREAT_COST_MINE = 4;
const THREAT_COST_SNEK = 6;
const DIAG_COST = 1.41421;

export const INITIAL_ASTAR_LIST_SIZE = GRIDCOUNT.x * GRIDCOUNT.y;

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

  // boolean (0, 1) map to keep track of node closed state
  private closed: Uint8Array;

  // boolean (0, 1) map to keep track of node visited state
  private visited: Uint8Array;

  // g score lookup for coord
  private gScore: Float32Array;

  // h score lookup for coord
  private hScore: Float32Array;

  // cell weight. less=preferred, INFINITY=unnavigable (e.g. wall)
  private weight: Float32Array;

  // result of a-star search()
  private path: Uint16Array;
  private pathLength: number;
  private pathCost: number;

  private bestPath: Uint16Array;
  private bestPathLength: number;
  private bestPathCost: number;

  // dirty items to be cleaned up on next search() call
  private dirtyList: Uint16Array;
  private dirtyListLength: number;

  // threats
  private mines: AnimationList;
  private snekCoord: number;

  private closest: number;

  constructor(_options?: Partial<AStarOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ..._options};
    this.mines = _options?.mines;
    this.openList = new Uint16Array(INITIAL_ASTAR_LIST_SIZE);
    this.openListLength = 0;
    this.parent = new Int16Array(INITIAL_ASTAR_LIST_SIZE);
    this.closed = new Uint8Array(INITIAL_ASTAR_LIST_SIZE);
    this.visited = new Uint8Array(INITIAL_ASTAR_LIST_SIZE);
    this.gScore = new Float32Array(INITIAL_ASTAR_LIST_SIZE);
    this.hScore = new Float32Array(INITIAL_ASTAR_LIST_SIZE);
    this.weight = new Float32Array(INITIAL_ASTAR_LIST_SIZE);
    this.path = new Uint16Array(INITIAL_ASTAR_LIST_SIZE);
    this.pathLength = 0;
    this.pathCost = 0;
    this.bestPath = new Uint16Array(INITIAL_ASTAR_LIST_SIZE);
    this.bestPathLength = 0;
    this.bestPathCost = 0;
    this.dirtyList = new Uint16Array(INITIAL_ASTAR_LIST_SIZE);
    this.dirtyListLength = 0;
    this.reset();
  }

  public reset() {
    this.validate();
    this.openList.fill(0);
    this.parent.fill(-1);
    this.closed.fill(0);
    this.visited.fill(0);
    this.gScore.fill(0);
    this.hScore.fill(0);
    this.weight.fill(1);
    this.path.fill(0);
    this.bestPath.fill(0);
    this.dirtyList.fill(0);
    this.openListLength = 0;
    this.pathLength = 0;
    this.pathCost = 0;
    this.bestPathLength = 0;
    this.bestPathCost = 0;
    this.dirtyListLength = 0;
    this.closest = -1;
    this.snekCoord = -1;
  }

  public setSnekCoord(coord: number) {
    this.snekCoord = coord;
  }

  public setWall(x: number, y: number) {
    this.weight[getCoordIndex2(x, y)] = ASTAR_WALL;
  }

  public setWallByCoord(coord: number) {
    this.weight[coord] = ASTAR_WALL;
  }

  public setWeight(x: number, y: number, weight: number) {
    const coord = getCoordIndex2(x, y);
    this.setWeightByCoord(coord, weight);
  }

  public setWeightByCoord(coord: number, weight: number) {
    this.weight[coord] = Math.max(weight, 1);
  }

  public getBestPath() {
    const best: number[] = new Array(this.bestPathLength).fill(0);
    for (let i = 0; i < this.bestPathLength; i++) {
      best[i] = this.bestPath[i];
    }
    return best;
  }

  public getLatestPath() {
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
    this.openListLength = 0;
    for (let i = 0; i < this.dirtyListLength; i++) {
      this.gScore[i] = 0;
      this.hScore[i] = 0;
      this.visited[i] = 0;
      this.closed[i] = 0;
      this.parent[i] = -1;
    }
    this.dirtyListLength = 0;
    this.closest = -1;

    this.hScore[0] = getTraversalDistance(startx, starty, endx, endy);
    this.addToOpenList(startCoord);
    this.addToDirtyList(startCoord);

    while (this.openListLength > 0) {
      const current = this.extractMinFromOpenList();
      if (current < 0) break;

      this.addToDirtyList(current);
      this.closed[current] = 1;

      // build path if we have arrived at the target
      if (current === endCoord) {
        this.pathCost = this.gScore[current] + this.hScore[current];
        this.constructPath(current);
        // maybe set best path
        if (this.path.length && (
          !this.bestPathLength || this.pathCost <= this.bestPathCost || startCoord !== this.bestPath[0]
        )) {
          this.bestPathLength = this.pathLength;
          for (let i = 0; i < this.pathLength; i++) {
            this.bestPath[i] = this.path[i];
          }
        }
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
      const neighbors = allowDiagonals
        ? [left, right, up, down, upleft, upright, downleft, downright]
        : [left, right, up, down];

      // check neighbors
      for (let idx = 0; idx < neighbors.length; idx++) {
        const neighbor = neighbors[idx];
        if (neighbor < 0 || this.closed[neighbor] || this.weight[neighbor] === ASTAR_WALL) {
          continue;
        }
        const nx = Math.floor(neighbor % GRIDCOUNT.x);
        const ny = Math.floor(neighbor / GRIDCOUNT.x);
        // calculate threat costs
        const distToClosestMine = this.mines?.getClosestTraversalDistance(nx, ny) ?? Infinity;
        const distToSnekHead = (() => {
          if (this.snekCoord < 0) return Infinity
          const sx = Math.floor(this.snekCoord % GRIDCOUNT.x);
          const sy = Math.floor(this.snekCoord / GRIDCOUNT.x);
          return getTraversalDistance(nx, ny, sx, sy);
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
        const gScore = this.gScore[current]
          + (this.weight[neighbor] || 1) * diagCostMultiplier
          + threatCost;
        // set neighbor fields, add to open list
        if (!this.visited[neighbor] || gScore < this.gScore[neighbor]) {
          const visited = this.visited[neighbor];
          const hScore = getTraversalDistance(nx, ny, endx, endy);
          this.visited[neighbor] = 1;
          this.parent[neighbor] = current;
          this.gScore[neighbor] = gScore;
          this.hScore[neighbor] = hScore;
          this.addToDirtyList(neighbor);
          // set closest node
          const closest = this.closest;
          if (
            allowClosest && (
              closest < 0 ||
              this.hScore[neighbor] < this.hScore[closest] ||
              (this.hScore[neighbor] === this.hScore[closest] && this.gScore[neighbor] < this.gScore[closest])
            )
          ){
            this.closest = neighbor;
          }
          if (!visited) {
            this.addToOpenList(neighbor);
          } else {
            this.bhRescoreElement(neighbor);
          }
        }
      }
    }

    // build path to closest node if it exists
    if (allowClosest && this.closest >= 0) {
      const current = this.closest;
      this.pathCost = this.gScore[current] + this.hScore[current];
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

  private addToDirtyList(coord: number) {
    this.dirtyList[this.dirtyListLength] = coord;
    this.dirtyListLength++;
  }

  private validate() {
    if (IS_DEV) {
      type ValidationTest = [ArrayLike<any>, ArrayLike<any>, string];
      const tests: ValidationTest[] = [
        [this.openList, this.parent, "openList, parent"],
        [this.openList, this.closed, "openList, closed"],
        [this.openList, this.visited, "openList, visited"],
        [this.openList, this.gScore, "openList, gScore"],
        [this.openList, this.hScore, "openList, hScore"],
        [this.openList, this.weight, "openList, weight"],
        [this.openList, this.path, "openList, path"],
        [this.openList, this.bestPath, "openList, bestPath"],
        [this.openList, this.dirtyList, "openList, dirtyList"],
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
        const isWall = this.weight[coord] === ASTAR_WALL;
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

  private addToOpenList(coord: number) {
    const i = this.openListLength;
    this.openList[i] = coord;
    this.openListLength++;
    this.bhSinkDown(i);
  }

  private extractMinFromOpenList() {
    if (this.openListLength === 0) {
      return -1;
    }
    const result = this.openList[0];
    const end = this.openList[this.openListLength - 1];
    this.openListLength--;
    if (this.openListLength > 0) {
      this.openList[0] = end;
      this.bhBubbleUp(0);
    }
    return result;
  }

  private bhRescoreElement(coord: number) {
    const i = this.openList.indexOf(coord);
    if (i > -1) {
      const j = this.bhSinkDown(i);
      this.bhBubbleUp(j);
    }
  }

  private bhSinkDown(_index: number) {
    const coord = this.openList[_index];
    let i = _index;
    let escapeHatch = 0;
    while (i > 0 && escapeHatch < 1000) {
      escapeHatch++;
      const parentIndex = (i - 1) >> 1; // floor((i - 1) / 2)
      const parentCoord = this.openList[parentIndex];
      const fScoreCurrent = this.gScore[coord] + this.hScore[coord];
      const fScoreParent = this.gScore[parentCoord] + this.hScore[parentCoord];
      if (fScoreCurrent < fScoreParent) {
        this.openList[parentIndex] = coord;
        this.openList[i] = parentCoord;
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

  private bhBubbleUp(_index: number) {
    const length = this.openListLength;
    const coord = this.openList[_index];
    const fScoreOriginal = this.gScore[coord] + this.hScore[coord];
    let fScoreLeft = 0;
    let i = _index;
    let escapeHatch = 0;
    while (escapeHatch < 1000) {
      escapeHatch++;
      const left = (i << 1) + 1; // 2i + 1
      const right = (i << 1) + 2; // 2i + 2
      let swap = 0;
      if (left < length) {
        const leftCoord = this.openList[left];
        fScoreLeft = this.gScore[leftCoord] + this.hScore[leftCoord];
        if (fScoreLeft < fScoreOriginal) {
          swap = left;
        }
      }
      if (right < length) {
        const rightCoord = this.openList[right];
        const fScoreRight = this.gScore[rightCoord] + this.hScore[rightCoord];
        if (fScoreRight < (swap ? fScoreLeft : fScoreOriginal)) {
          swap = right;
        }
      }
      if (swap > 0) {
        this.openList[i] = this.openList[swap];
        this.openList[swap] = coord;
        i = swap;
      } else {
        return i;
      }
    }
    throw new Error(`Infinite loop averted! Looped ${escapeHatch} times before stopping.`);
  }

  public test__addToOpenList(coord: number) {
    this.addToOpenList(coord);
  }

  public test__extractMinFromOpenList() {
    return this.extractMinFromOpenList();
  }

  public test__bhSinkDown(index: number) {
    return this.bhSinkDown(index);
  }

  public test__bhBubbleUp(index: number) {
    return this.bhBubbleUp(index);
  }

  public test__bhRescoreElement(index: number) {
    return this.bhRescoreElement(index);
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
