import { Float16Array } from '@petamoriken/float16';

const FLAG_WALL = 1;
const FLAG_CLOSED = 2;
const FLAG_VISITED = 4;

// number of bytes contained in each grid node
const GRID_NODE_BYTELENGTH = 10;
const BYTE_OFFSET_COORD = 0;
const BYTE_OFFSET_FLAGS = 2;
const BYTE_OFFSET_GSCORE = 4;
const BYTE_OFFSET_HSCORE = 6;
const BYTE_OFFSET_PARENT = 8;


export class Grid implements ArrayLike<ArrayBuffer> {
  // C-like structs in JavaScript!
  // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays#working_with_complex_data_structures
  // Note that Uint16Array and Float16Array offsets must be a multiple of 2, and Float32Array offsets must be a multiple of 4
  private buffer: ArrayBuffer;
  private _length;

  constructor(length: number) {
    this.buffer = new ArrayBuffer(GRID_NODE_BYTELENGTH * length);
    this._length = length;
  }
  readonly [n: number]: ArrayBuffer;
  public get length() { return this._length; }

  public reset() {
    const length = this._length;
    for (let i = 0; i < length; i++) {
      this.setCoord(i, 0);
      this.setFlags(i, 0);
      this.setGScore(i, 0);
      this.setHScore(i, 0);
      this.setParent(i, -1);
    }
  }

  public getCoord(idx: number) {
    const view = new Uint16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_COORD, 1);
    return view[0];
  }
  public setCoord(idx: number, val: number) {
    const view = new Uint16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_COORD, 1);
    view[0] = val;
  }

  public getFlags(idx: number) {
    const view = new Uint16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_FLAGS, 1);
    return view[0];
  }
  public setFlags(idx: number, val: number) {
    const view = new Uint16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_FLAGS, 1);
    view[0] = val;
  }

  public getFlagClosed(idx: number) {
    const view = new Uint16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_FLAGS, 1);
    return !!(view[0] & FLAG_CLOSED);
  }
  public setFlagClosed(idx: number, val: boolean) {
    const view = new Uint16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_FLAGS, 1);
    if (val) {
      view[0] |= FLAG_CLOSED;
    } else {
      view[0] &= ~FLAG_CLOSED;
    }
  }

  public getFlagVisited(idx: number) {
    const view = new Uint16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_FLAGS, 1);
    return !!(view[0] & FLAG_VISITED);
  }
  public setFlagVisited(idx: number, val: boolean) {
    const view = new Uint16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_FLAGS, 1);
    if (val) {
      view[0] |= FLAG_VISITED;
    } else {
      view[0] &= ~FLAG_VISITED;
    }
  }

  public getFlagWall(idx: number) {
    const view = new Uint16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_FLAGS, 1);
    return !!(view[0] & FLAG_WALL);
  }
  public setFlagWall(idx: number, val: boolean) {
    const view = new Uint16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_FLAGS, 1);
    if (val) {
      view[0] |= FLAG_WALL;
    } else {
      view[0] &= ~FLAG_WALL;
    }
  }

  public getGScore(idx: number) {
    const view = new Float16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_GSCORE, 1);
    return view[0];
  }
  public setGScore(idx: number, val: number) {
    const view = new Float16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_GSCORE, 1);
    view[0] = val;
  }

  public getHScore(idx: number) {
    const view = new Float16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_HSCORE, 1);
    return view[0];
  }
  public setHScore(idx: number, val: number) {
    const view = new Float16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_HSCORE, 1);
    view[0] = val;
  }

  public getFScore(idx: number) {
    return this.getGScore(idx) + this.getHScore(idx);
  }

  public getParent(idx: number) {
    const view = new Int16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_PARENT, 1);
    return view[0];
  }
  public setParent(idx: number, val: number) {
    const view = new Int16Array(this.buffer, idx * GRID_NODE_BYTELENGTH + BYTE_OFFSET_PARENT, 1);
    view[0] = val;
  }
}
