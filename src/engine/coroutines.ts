import P5 from "p5";
import { v4 as uuid } from 'uuid';

import { IEnumerator } from "../types";
import { clamp } from "../utils";
import { anyButtonPressedThisFrame, getGamepad, wasPressedThisFrame } from "./gamepad";
import { Button } from "./gamepad/StandardGamepadMapping";

type UUID = string;

export class Coroutines {
  private _p5: P5;
  private _coroutines: IEnumerator[] = []
  private _coroutinesMap: Record<UUID, IEnumerator> = {}

  constructor(p5: P5) {
    this._p5 = p5;
  }

  start = (enumerator: IEnumerator): UUID => {
    if (!enumerator) return;
    const id = uuid();
    this._coroutines.push(enumerator);
    this._coroutinesMap[id] = enumerator;
    return id;
  }

  stop = (id: UUID | null | undefined) => {
    if (!id) return;
    if (!this._coroutinesMap[id]) return;
    for (let i = 0; i < this._coroutines.length; i++) {
      if (this._coroutines[i] === this._coroutinesMap[id]) {
        try { this._coroutines[i].return(); } catch { /* fail silently */ }
        this._coroutines[i] = null;
        this._coroutinesMap[id] = null;
        this._coroutines = this._coroutines.slice(0, i).concat(this._coroutines.slice(i + 1))
        return;
      }
    }
    this._coroutinesMap[id] = null;
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
        this._coroutines[i] = null;
      }
    }
    this._coroutines = this._coroutines.filter(c => !!c);
  }

  waitForTime = (durationMs: number, callback?: (t: number) => void, allowSkip = false): IEnumerator => {
    return this._waitForTime(durationMs, callback, allowSkip);
  }

  waitForAnyKey = (callback?: () => void): IEnumerator => {
    return this._waitForAnyKey(callback);
  }

  waitForEnterKey = (callback?: () => void): IEnumerator => {
    return this._waitForEnterKey(callback);
  }

  // make private so that we can expose `waitForTime` as an arrow function, retaining `this` scope
  private * _waitForTime(durationMs: number, callback?: (t: number) => void, allowSkip = false): IEnumerator {
    if (!durationMs) return;
    let timeRemaining = durationMs;
    while (
      timeRemaining > 0 &&
      ((allowSkip && timeRemaining < durationMs - 200)
        ? !this._p5.keyIsDown(this._p5.ENTER) &&
          !wasPressedThisFrame(getGamepad(), Button.Start) &&
          !wasPressedThisFrame(getGamepad(), Button.East)
        : true)
    ) {
      timeRemaining -= this._p5.deltaTime;
      const t = clamp((durationMs - timeRemaining) / durationMs, 0, 1);
      if (callback) callback(t);
      yield null;
    }
  }

  private * _waitForAnyKey(callback?: () => void): IEnumerator {
    this._p5.keyIsPressed = false;
    while (!this._p5.keyIsPressed && !anyButtonPressedThisFrame(getGamepad())) {
      if (callback) callback();
      yield null;
    }
  }

  private * _waitForEnterKey(callback?: () => void): IEnumerator {
    while (!this._p5.keyIsDown(this._p5.ENTER) && !wasPressedThisFrame(getGamepad(), Button.Start)) {
      if (callback) callback();
      yield null;
    }
  }

  private cleanupMappedEnumerator(enumerator: IEnumerator) {
    const keys = Object.keys(this._coroutinesMap);
    for (let i = 0; i < keys.length; i++) {
      if (enumerator === this._coroutinesMap[keys[i]]) {
        this._coroutinesMap[keys[i]] = null;
        break;
      }
    }
  }
}
