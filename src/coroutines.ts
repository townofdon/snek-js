import P5 from "p5";
import { IEnumerator } from "./types";

export class Coroutines {
  private _coroutines: IEnumerator[] = []
  private _p5: P5;

  constructor(p5: P5) {
    this._p5 = p5;
  }

  start = (enumerator: IEnumerator): number => {
    this._coroutines.push(enumerator);
    const index = this._coroutines.length - 1;
    return index;
  }

  stop = (index: number) => {
    if (index < 0) return;
    if (index >= this._coroutines.length) return;
    delete this._coroutines[index];
    this._coroutines = this._coroutines.slice(0, index).concat(this._coroutines.slice(index + 1))
  }

  stopAll = () => {
    this._coroutines = [];
  }

  tick = () => {
    for (let i = 0; i < this._coroutines.length; i++) {
      if (!this._coroutines[i]) continue;
      const value = this._coroutines[i].next();
      if (value.done) delete this._coroutines[i];
    }
    this._coroutines = this._coroutines.filter(c => !!c);
  }

  waitForTime = (durationMs: number, callback?: () => void): IEnumerator => {
    return this._waitForTime(durationMs, callback);
  }

  // make private so that we can expose `waitForTime` as an arrow function, retaining `this` scope
  private *_waitForTime(durationMs: number, callback?: () => void): IEnumerator {
    let timeRemaining = durationMs;
    while (timeRemaining > 0) {
      timeRemaining -= this._p5.deltaTime;
      if (callback) callback();
      yield null;
    }
  }
}