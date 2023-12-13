import P5 from "p5";
import { v4 as uuid } from 'uuid';
import { IEnumerator } from "./types";
import { clamp } from "./utils";

type UUID = string;

export class Coroutines {
  private _p5: P5;
  private _coroutines: IEnumerator[] = []
  private _coroutinesMap: Record<UUID, IEnumerator> = {}

  constructor(p5: P5) {
    this._p5 = p5;
  }

  start = (enumerator: IEnumerator): UUID => {
    const id = uuid();
    // @ts-ignore
    enumerator.id = id;
    this._coroutines.push(enumerator);
    this._coroutinesMap[id] = enumerator;
    return id;
  }

  stop = (id: UUID | null | undefined) => {
    if (!id) return;
    if (!this._coroutinesMap[id]) return;
    for (let i = 0; i < this._coroutines.length; i++) {
      if (this._coroutines[i] === this._coroutinesMap[id]) {
        delete this._coroutines[i];
        delete this._coroutinesMap[id];
        this._coroutines = this._coroutines.slice(0, i).concat(this._coroutines.slice(i + 1))
        return;
      }
    }
    delete this._coroutinesMap[id];
  }

  stopAll = () => {
    this._coroutines = [];
    this._coroutinesMap = {};
  }

  tick = () => {
    for (let i = 0; i < this._coroutines.length; i++) {
      if (!this._coroutines[i]) continue;
      const value = this._coroutines[i].next();
      if (value.done) {
        this.cleanupMappedEnumerator(this._coroutines[i]);
        delete this._coroutines[i];
      }
    }
    this._coroutines = this._coroutines.filter(c => !!c);
  }

  waitForTime = (durationMs: number, callback?: (t: number) => void): IEnumerator => {
    return this._waitForTime(durationMs, callback);
  }

  waitForAnyKey = (callback?: () => void): IEnumerator => {
    return this._waitForAnyKey(callback);
  }

  // make private so that we can expose `waitForTime` as an arrow function, retaining `this` scope
  private *_waitForTime(durationMs: number, callback?: (t: number) => void): IEnumerator {
    let timeRemaining = durationMs;
    while (timeRemaining > 0) {
      timeRemaining -= this._p5.deltaTime;
      const t = clamp((durationMs - timeRemaining) / durationMs, 0, 1);
      if (callback) callback(t);
      yield null;
    }
  }

  private *_waitForAnyKey(callback?: () => void): IEnumerator {
    this._p5.keyIsPressed = false;
    while (!this._p5.keyIsPressed) {
      if (callback) callback();
      yield null;
    }
  }

  private cleanupMappedEnumerator(enumerator: IEnumerator) {
    const keys = Object.keys(this._coroutinesMap);
    for (let i = 0; i < keys.length; i++) {
      if (enumerator === this._coroutinesMap[keys[i]]) {
        delete this._coroutinesMap[keys[i]];
        break;
      }
    }
  }
}
