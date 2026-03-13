import { GRIDCOUNT, IS_DEV } from "../constants";
import { getCoordIndex2, getTraversalDistance } from "../utils";

export const ASTAR_WALL = Number.MAX_SAFE_INTEGER; // this works for 32-bit floats

export const INITIAL_ASTAR_LIST_SIZE = GRIDCOUNT.x * GRIDCOUNT.y;

/**
 * Non-allocating A-Star search algorithm.
 * Uses a Binary Heap internally for performance.
 */
export class AStar {
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

  constructor() {
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

  public search(startx: number, starty: number, endx: number, endy: number): boolean {
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
        if (!this.bestPathLength || this.pathCost <= this.bestPathCost || startCoord !== this.bestPath[0] || endCoord !== this.bestPath[this.bestPathLength - 1]) {
          this.bestPathLength = this.pathLength;
          for (let i = 0; i < this.pathLength; i++) {
            this.bestPath[i] = this.path[i];
          }
        }
        return true;
      }

      const x = Math.floor(current % GRIDCOUNT.x);
      const y = Math.floor(current / GRIDCOUNT.x);
      const left = x > 0 ? getCoordIndex2(x - 1, y) : -1;
      const right = x < GRIDCOUNT.x - 1 ? getCoordIndex2(x + 1, y) : -1;
      const up = y > 0 ? getCoordIndex2(x, y - 1) : -1;
      const down = y < GRIDCOUNT.y - 1 ? getCoordIndex2(x, y + 1) : -1;
      [left, right, up, down].forEach(neighbor => {
        if (neighbor < 0 || this.closed[neighbor] || this.weight[neighbor] === ASTAR_WALL) {
          return;
        }
        const gScore = this.gScore[current] + (this.weight[neighbor] || 1);
        if (!this.visited[neighbor] || gScore < this.gScore[neighbor]) {
          const nx = Math.floor(neighbor % GRIDCOUNT.x);
          const ny = Math.floor(neighbor / GRIDCOUNT.x);
          const visited = this.visited[neighbor];
          this.visited[neighbor] = 1;
          this.parent[neighbor] = current;
          this.gScore[neighbor] = gScore;
          this.hScore[neighbor] = getTraversalDistance(nx, ny, endx, endy);
          this.addToDirtyList(neighbor);

          // TODO: ADD CLOSEST BEHAVIOR

          if (!visited) {
            this.addToOpenList(neighbor);
          } else {
            this.bhRescoreElement(neighbor);
          }
        }
      })
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
