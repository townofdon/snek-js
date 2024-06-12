import { Vector } from "p5";

import { SetStateValue, Tile } from "./editorTypes";
import { DIR, EditorData, EditorDataSlice, EditorOptions, KeyChannel, Level, Palette, PortalChannel } from "../types";
import { coordToVec, getCoordIndex, getCoordIndex2, inverseLerp, isValidKeyChannel, isValidPortalChannel, lerp } from "../utils";
import { deepCloneData, getEditorDataFromLevel, mergeData, mergeDataSlice } from "./utils/editorUtils";
import { tileFloodFill } from "./utils/floodFill";

/**
 * THE COMMAND PATTERN
 *
 * see: https://www.geeksforgeeks.org/command-pattern/
 */
export interface Command {
  name: string,
  execute: () => boolean,
  rollback: () => void,
}

export class NoOpCommand implements Command {
  public readonly name = 'NoOp';
  execute = () => false;
  rollback = () => { };
}

export type SetData = (setter: SetStateValue<EditorData>) => void
export type RollbackLastCoordUpdated = () => void

abstract class SetElementCommand implements Command {
  public abstract readonly name: string;
  protected readonly initial: EditorDataSlice;
  protected newData: EditorDataSlice | null;
  protected readonly coord: number;
  protected readonly setData: SetData;
  protected readonly rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined;
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    this.setData = setData;
    this.rollbackLastCoordUpdated = rollbackLastCoordUpdated;
    this.coord = coord;
    this.initial = {
      coord: this.coord,
      apple: data.applesMap[this.coord],
      barrier: data.barriersMap[this.coord],
      deco1: data.decoratives1Map[this.coord],
      deco2: data.decoratives2Map[this.coord],
      door: data.doorsMap[this.coord],
      key: data.keysMap[this.coord],
      lock: data.locksMap[this.coord],
      nospawn: data.nospawnsMap[this.coord],
      passable: data.passablesMap[this.coord],
      portal: data.portalsMap[this.coord],
      playerSpawnPosition: data.playerSpawnPosition.copy(),
      startDirection: data.startDirection,
    };
    this.newData = {
      coord: this.coord,
      apple: false,
      barrier: false,
      deco1: false,
      deco2: false,
      door: false,
      key: null,
      lock: null,
      nospawn: false,
      passable: false,
      portal: null,
      playerSpawnPosition: data.playerSpawnPosition.copy(),
      startDirection: data.startDirection,
    }
  }
  execute = () => {
    if (!this.newData) {
      return false;
    }
    this.setData(prevData => mergeDataSlice(prevData, this.newData));
    return true;
  };
  rollback = () => {
    if (this.rollbackLastCoordUpdated) {
      this.rollbackLastCoordUpdated();
    }
    this.setData(prevData => mergeDataSlice(prevData, this.initial));
  };
}

export class SetPlayerSpawnCommand extends SetElementCommand {
  public readonly name = 'Set Player Spawn';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (getCoordIndex(data.playerSpawnPosition) === coord) {
      this.newData = null;
    } else {
      this.newData.playerSpawnPosition = coordToVec(coord);
      this.newData.apple = data.applesMap[this.coord];
      this.newData.barrier = data.barriersMap[this.coord];
      this.newData.deco1 = data.decoratives1Map[this.coord];
      this.newData.deco2 = data.decoratives2Map[this.coord];
      this.newData.door = data.doorsMap[this.coord];
      this.newData.key = data.keysMap[this.coord];
      this.newData.lock = data.locksMap[this.coord];
      this.newData.nospawn = data.nospawnsMap[this.coord];
      this.newData.passable = data.passablesMap[this.coord];
      this.newData.portal = data.portalsMap[this.coord];
    }
  }
}

export class DeleteElementCommand extends SetElementCommand {
  public readonly name = 'Erase';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (
      !data.applesMap[this.coord] &&
      !data.barriersMap[this.coord] &&
      !data.decoratives1Map[this.coord] &&
      !data.decoratives2Map[this.coord] &&
      !data.doorsMap[this.coord] &&
      !isValidKeyChannel(data.keysMap[this.coord]) &&
      !isValidKeyChannel(data.locksMap[this.coord]) &&
      !data.nospawnsMap[this.coord] &&
      !data.passablesMap[this.coord] &&
      !isValidPortalChannel(data.portalsMap[this.coord])
    ) {
      this.newData = null;
    }
  }
}

export class SetAppleCommand extends SetElementCommand {
  public readonly name = 'Draw Apple';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.applesMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.apple = true;
    }
  }
}

export class SetBarrierCommand extends SetElementCommand {
  public readonly name = 'Draw Barrier';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.barriersMap[this.coord] && !data.passablesMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.barrier = true;
    }
  }
}

export class SetDecorative1Command extends SetElementCommand {
  public readonly name = 'Draw BG1';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.decoratives1Map[this.coord] &&
      !data.nospawnsMap[this.coord] &&
      !data.doorsMap[this.coord] &&
      !data.applesMap[this.coord] &&
      !isValidKeyChannel(data.locksMap[this.coord])
    ) {
      this.newData = null;
    } else {
      this.newData.deco1 = true;
    }
  }
}

export class SetDecorative2Command extends SetElementCommand {
  public readonly name = 'Draw BG2';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.decoratives2Map[this.coord] &&
      !data.nospawnsMap[this.coord] &&
      !data.doorsMap[this.coord] &&
      !data.applesMap[this.coord] &&
      isValidKeyChannel(data.locksMap[this.coord])
    ) {
      this.newData = null;
    } else {
      this.newData.deco2 = true;
    }
  }
}

export class SetDoorCommand extends SetElementCommand {
  public readonly name = 'Draw Door';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.doorsMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.door = true;
    }
  }
}

export class SetKeyCommand extends SetElementCommand {
  public readonly name = 'Draw Key';
  public constructor(coord: number, channel: KeyChannel, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (isValidKeyChannel(data.keysMap[this.coord]) && data.keysMap[this.coord] === channel) {
      this.newData = null;
    } else {
      this.newData.key = channel;
      if (data.barriersMap[this.coord]) {
        this.newData.barrier = true;
        this.newData.passable = true;
      }
    }
  }
}

export class SetLockCommand extends SetElementCommand {
  public readonly name = 'Draw Lock';
  public constructor(coord: number, channel: KeyChannel, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (isValidKeyChannel(data.locksMap[this.coord]) && data.locksMap[this.coord] === channel) {
      this.newData = null;
    } else {
      this.newData.lock = channel;
    }
  }
}

export class SetNospawnCommand extends SetElementCommand {
  public readonly name = 'Draw Nospawn';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    const shouldIgnore = (
      data.applesMap[this.coord] ||
      data.barriersMap[this.coord] ||
      data.doorsMap[this.coord] ||
      isValidKeyChannel(data.keysMap[this.coord]) ||
      isValidKeyChannel(data.locksMap[this.coord]) ||
      isValidPortalChannel(data.portalsMap[this.coord])
    );
    if (shouldIgnore) {
      this.newData = null;
    } else {
      this.newData.nospawn = true;
      if (data.decoratives1Map[this.coord]) {
        this.newData.deco1 = true;
      }
      if (data.decoratives2Map[this.coord]) {
        this.newData.deco2 = true;
      }
    }
  }
}

export class SetPassableCommand extends SetElementCommand {
  public readonly name = 'Draw Passable';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.passablesMap[this.coord] && data.barriersMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.barrier = true;
      this.newData.passable = true;
    }
  }
}

export class SetPortalCommand extends SetElementCommand {
  public readonly name = 'Draw Portal';
  public constructor(coord: number, channel: PortalChannel, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (isValidPortalChannel(data.portalsMap[this.coord]) && data.portalsMap[this.coord] === channel) {
      this.newData = null;
    } else {
      this.newData.portal = channel;
    }
  }
}

abstract class SetBatchElementsCommand implements Command {
  public abstract readonly name: string;
  protected readonly dataRef: React.MutableRefObject<EditorData>;
  protected prevData: EditorData | undefined;
  protected newData: EditorDataSlice | null;
  protected resolveNewData: (coord: number) => (Partial<EditorDataSlice> | null);
  protected readonly coords: number[];
  protected readonly setData: SetData;
  protected readonly rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined;
  protected test2: (() => boolean) | undefined;
  public constructor(coords: number[], dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    this.setData = setData;
    this.rollbackLastCoordUpdated = rollbackLastCoordUpdated;
    this.coords = coords;
    this.dataRef = dataRef;
    this.newData = {
      coord: -1,
      apple: false,
      barrier: false,
      deco1: false,
      deco2: false,
      door: false,
      key: null,
      lock: null,
      nospawn: false,
      passable: false,
      portal: null,
      playerSpawnPosition: dataRef.current.playerSpawnPosition.copy(),
      startDirection: dataRef.current.startDirection,
    };
    this.resolveNewData = () => null;
  }
  execute = () => {
    if (!this.newData) {
      return false;
    }
    this.prevData = deepCloneData(this.dataRef.current);
    let shouldUpdate = false;
    let updates: EditorData = deepCloneData(this.dataRef.current);
    for (let i = 0; i < this.coords.length; i++) {
      if (!this.test(this.coords[i])) continue;
      updates = mergeDataSlice(updates, { ...this.newData, ...this.resolveNewData(this.coords[i]) }, this.coords[i]);
      shouldUpdate = true;
    }
    this.setData(mergeData(this.dataRef.current, updates));
    return true;
  };
  rollback = () => {
    if (!this.prevData) return;
    if (this.rollbackLastCoordUpdated) {
      this.rollbackLastCoordUpdated();
    }
    this.setData(mergeData(this.dataRef.current, this.prevData));
  };
  protected abstract test: (coord: number) => boolean;
}

interface SetLineOptions {
  thickLine?: false,
}

abstract class SetLineCommand extends SetBatchElementsCommand {
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, opts: SetLineOptions = {}) {
    const vec = {
      from: coordToVec(from),
      to: coordToVec(to),
    };
    const getCoordsThick = () => {
      const coords: number[] = [];
      const numSteps = Math.max(Math.abs(vec.from.x - vec.to.x), Math.abs(vec.from.y - vec.to.y)) * 2;
      if (numSteps <= 0) {
        return [];
      } else if (numSteps <= 1) {
        coords.push(getCoordIndex(vec.to));
      } else {
        for (let i = 0; i < numSteps; i++) {
          const x = Math.round(lerp(vec.from.x, vec.to.x, i / (numSteps - 1)));
          const y = Math.round(lerp(vec.from.y, vec.to.y, i / (numSteps - 1)));
          const coord = getCoordIndex2(x, y);
          if (!coords.includes(coord)) {
            coords.push(coord);
          }
        }
      }
      return coords;
    }
    const getCoords = () => {
      const coords: number[] = [];
      const numStepsX = Math.abs(vec.from.x - vec.to.x);
      const numStepsY = Math.abs(vec.from.y - vec.to.y);
      if (numStepsX >= numStepsY) {
        const xMin = Math.min(vec.from.x, vec.to.x);
        const xMax = Math.max(vec.from.x, vec.to.x);
        for (let x = xMin; x <= xMax; x++) {
          const y = Math.round(lerp(vec.from.y, vec.to.y, inverseLerp(vec.from.x, vec.to.x, x)));
          const coord = getCoordIndex2(x, y);
          if (!coords.includes(coord)) {
            coords.push(coord);
          }
        }
      } else {
        const yMin = Math.min(vec.from.y, vec.to.y);
        const yMax = Math.max(vec.from.y, vec.to.y);
        for (let y = yMin; y <= yMax; y++) {
          const x = Math.round(lerp(vec.from.x, vec.to.x, inverseLerp(vec.from.y, vec.to.y, y)));
          const coord = getCoordIndex2(x, y);
          if (!coords.includes(coord)) {
            coords.push(coord);
          }
        }
      }
      return coords;
    }
    const coords = opts.thickLine ? getCoordsThick() : getCoords();
    super(coords, data, setData, rollbackLastCoordUpdated);
  }
}

export class DeleteLineCommand extends SetLineCommand {
  public readonly name = 'Erase';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
  }
  protected test = (coord: number) => {
    return (
      this.dataRef.current.applesMap[coord] ||
      this.dataRef.current.barriersMap[coord] ||
      this.dataRef.current.decoratives1Map[coord] ||
      this.dataRef.current.decoratives2Map[coord] ||
      this.dataRef.current.doorsMap[coord] ||
      isValidKeyChannel(this.dataRef.current.keysMap[coord]) ||
      isValidKeyChannel(this.dataRef.current.locksMap[coord]) ||
      this.dataRef.current.nospawnsMap[coord] ||
      this.dataRef.current.passablesMap[coord] ||
      isValidPortalChannel(this.dataRef.current.portalsMap[coord])
    );
  };
}

export class SetLineAppleCommand extends SetLineCommand {
  public readonly name = 'Draw Apple';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.apple = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.applesMap[coord];
  };
}

export class SetLineBarrierCommand extends SetLineCommand {
  public readonly name = 'Draw Barrier';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.barrier = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.barriersMap[coord] || this.dataRef.current.passablesMap[coord];
  };
}

export class SetLineDeco1Command extends SetLineCommand {
  public readonly name = 'Draw BG1';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.deco1 = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.decoratives1Map[coord] ||
      this.dataRef.current.nospawnsMap[coord] ||
      this.dataRef.current.doorsMap[coord] ||
      this.dataRef.current.applesMap[coord] ||
      isValidKeyChannel(this.dataRef.current.locksMap[coord]);
  };
}

export class SetLineDeco2Command extends SetLineCommand {
  public readonly name = 'Draw BG2';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.deco2 = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.decoratives2Map[coord] ||
      this.dataRef.current.nospawnsMap[coord] ||
      this.dataRef.current.doorsMap[coord] ||
      this.dataRef.current.applesMap[coord] ||
      isValidKeyChannel(this.dataRef.current.locksMap[coord]);
  };
}

export class SetLineDoorCommand extends SetLineCommand {
  public readonly name = 'Draw Door';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.door = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.doorsMap[coord];
  };
}

export class SetLineKeyCommand extends SetLineCommand {
  public readonly name = 'Draw Key';
  private channel: KeyChannel;
  public constructor(from: number, to: number, channel: KeyChannel, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.channel = channel;
    this.newData.key = channel;
    this.resolveNewData = (coord: number) => {
      const newData: Partial<EditorDataSlice> = {};
      if (data.current.barriersMap[coord]) {
        newData.barrier = true;
        newData.passable = true;
      }
      return newData;
    };
  }
  protected test = (coord: number) => {
    return this.dataRef.current.keysMap[coord] !== this.channel;
  };
}

export class SetLineLockCommand extends SetLineCommand {
  public readonly name = 'Draw Lock';
  private channel: KeyChannel;
  public constructor(from: number, to: number, channel: KeyChannel, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.channel = channel;
    this.newData.lock = channel;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.keysMap[coord] !== this.channel;
  };
}

export class SetLineNospawnCommand extends SetLineCommand {
  public readonly name = 'Draw Nospawn';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.nospawn = true;
    this.resolveNewData = (coord: number) => {
      const newData: Partial<EditorDataSlice> = {};
      if (data.current.decoratives1Map[coord]) {
        newData.deco1 = true;
      }
      if (data.current.decoratives2Map[coord]) {
        newData.deco2 = true;
      }
      return newData;
    };
  }
  protected test = (coord: number) => {
    const shouldIgnore = (
      this.dataRef.current.applesMap[coord] ||
      this.dataRef.current.barriersMap[coord] ||
      this.dataRef.current.doorsMap[coord] ||
      isValidKeyChannel(this.dataRef.current.keysMap[coord]) ||
      isValidKeyChannel(this.dataRef.current.locksMap[coord]) ||
      isValidPortalChannel(this.dataRef.current.portalsMap[coord])
    );
    return !shouldIgnore;
  };
}

export class SetLinePassableCommand extends SetLineCommand {
  public readonly name = 'Draw Passable';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.passable = true;
    this.newData.barrier = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.passablesMap[coord] || !this.dataRef.current.barriersMap[coord];
  };
}

export class SetLinePortalCommand extends SetLineCommand {
  public readonly name = 'Draw Portal';
  private channel: PortalChannel;
  public constructor(from: number, to: number, channel: PortalChannel, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.channel = channel;
    this.newData.portal = channel;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.portalsMap[coord] !== this.channel;
  };
}

abstract class SetRectangleCommand extends SetBatchElementsCommand {
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    const coords: number[] = [];
    const vec = {
      from: coordToVec(from),
      to: coordToVec(to),
    }
    for (let y = Math.min(vec.from.y, vec.to.y); y <= Math.max(vec.from.y, vec.to.y); y++) {
      for (let x = Math.min(vec.from.x, vec.to.x); x <= Math.max(vec.from.x, vec.to.x); x++) {
        coords.push(getCoordIndex2(x, y));
      }
    }
    super(coords, dataRef, setData, rollbackLastCoordUpdated);
  }
}

export class DeleteRectangleCommand extends SetRectangleCommand {
  public readonly name = 'Erase';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
  }
  protected test = (coord: number) => {
    return (
      this.dataRef.current.applesMap[coord] ||
      this.dataRef.current.barriersMap[coord] ||
      this.dataRef.current.decoratives1Map[coord] ||
      this.dataRef.current.decoratives2Map[coord] ||
      this.dataRef.current.doorsMap[coord] ||
      isValidKeyChannel(this.dataRef.current.keysMap[coord]) ||
      isValidKeyChannel(this.dataRef.current.locksMap[coord]) ||
      this.dataRef.current.nospawnsMap[coord] ||
      this.dataRef.current.passablesMap[coord] ||
      isValidPortalChannel(this.dataRef.current.portalsMap[coord])
    );
  };
}

export class SetRectangleAppleCommand extends SetRectangleCommand {
  public readonly name = 'Draw Apple';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.apple = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.applesMap[coord];
  };
}

export class SetRectangleBarrierCommand extends SetRectangleCommand {
  public readonly name = 'Draw Barrier';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.barrier = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.barriersMap[coord] || this.dataRef.current.passablesMap[coord];
  };
}

export class SetRectangleDeco1Command extends SetRectangleCommand {
  public readonly name = 'Draw BG1';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.deco1 = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.decoratives1Map[coord] ||
      this.dataRef.current.nospawnsMap[coord] ||
      this.dataRef.current.doorsMap[coord] ||
      this.dataRef.current.applesMap[coord] ||
      isValidKeyChannel(this.dataRef.current.locksMap[coord]);
  };
}

export class SetRectangleDeco2Command extends SetRectangleCommand {
  public readonly name = 'Draw BG2';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.deco2 = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.decoratives2Map[coord] ||
      this.dataRef.current.nospawnsMap[coord] ||
      this.dataRef.current.doorsMap[coord] ||
      this.dataRef.current.applesMap[coord] ||
      isValidKeyChannel(this.dataRef.current.locksMap[coord]);
  };
}

export class SetRectangleDoorCommand extends SetRectangleCommand {
  public readonly name = 'Draw Door';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.door = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.doorsMap[coord];
  };
}

export class SetRectangleKeyCommand extends SetRectangleCommand {
  public readonly name = 'Draw Key';
  private channel: KeyChannel;
  public constructor(from: number, to: number, channel: KeyChannel, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.channel = channel;
    this.newData.key = channel;
    this.resolveNewData = (coord: number) => {
      const newData: Partial<EditorDataSlice> = {};
      if (this.dataRef.current.barriersMap[coord]) {
        newData.barrier = true;
        newData.passable = true;
      }
      return newData;
    };
  }
  protected test = (coord: number) => {
    return this.dataRef.current.keysMap[coord] !== this.channel;
  };
}

export class SetRectangleLockCommand extends SetRectangleCommand {
  public readonly name = 'Draw Lock';
  private channel: KeyChannel;
  public constructor(from: number, to: number, channel: KeyChannel, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.channel = channel;
    this.newData.lock = channel;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.locksMap[coord] !== this.channel;
  };
}

export class SetRectangleNospawnCommand extends SetRectangleCommand {
  public readonly name = 'Draw Nospawn';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.nospawn = true;
    this.resolveNewData = (coord: number) => {
      const newData: Partial<EditorDataSlice> = {};
      if (dataRef.current.decoratives1Map[coord]) {
        newData.deco1 = true;
      }
      if (dataRef.current.decoratives2Map[coord]) {
        newData.deco2 = true;
      }
      return newData;
    };
  }
  protected test = (coord: number) => {
    const shouldIgnore = (
      this.dataRef.current.applesMap[coord] ||
      this.dataRef.current.barriersMap[coord] ||
      this.dataRef.current.doorsMap[coord] ||
      isValidKeyChannel(this.dataRef.current.keysMap[coord]) ||
      isValidKeyChannel(this.dataRef.current.locksMap[coord]) ||
      isValidPortalChannel(this.dataRef.current.portalsMap[coord])
    );
    return !shouldIgnore;
  };
}

export class SetRectanglePassableCommand extends SetRectangleCommand {
  public readonly name = 'Draw Passable';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.barrier = true;
    this.newData.passable = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.passablesMap[coord] || !this.dataRef.current.barriersMap[coord];
  };
}

export class SetRectanglePortalCommand extends SetRectangleCommand {
  public readonly name = 'Draw Portal';
  private channel: PortalChannel;
  public constructor(from: number, to: number, channel: PortalChannel, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.channel = channel;
    this.newData.portal = channel;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.portalsMap[coord] !== this.channel;
  };
}

export class SetPaletteCommand implements Command {
  public readonly name = 'Set Palette';
  private newPalette: Palette;
  private initial: Palette;
  private optionsRef: React.MutableRefObject<EditorOptions>;
  private setOptions: (val: EditorOptions) => void;
  public constructor(newPalette: Palette, optionsRef: React.MutableRefObject<EditorOptions>, setOptions: (val: EditorOptions) => void) {
    this.newPalette = newPalette;
    this.optionsRef = optionsRef;
    this.setOptions = setOptions;
    this.initial = { ...optionsRef.current.palette };
  }
  execute = () => {
    this.setOptions({ ...this.optionsRef.current, palette: { ...this.newPalette } });
    return true;
  };
  rollback = () => {
    this.setOptions({ ...this.optionsRef.current, palette: { ...this.initial } });
  };
}

export class LoadLevelCommand implements Command {
  public readonly name = 'Load Level';
  private level: Level;
  private initialData: EditorData;
  private initialOptions: EditorOptions;
  private setData: (val: EditorData) => void;
  private setOptions: (val: EditorOptions) => void;
  public constructor(level: Level, data: EditorData, options: EditorOptions, setData: (val: EditorData) => void, setOptions: (val: EditorOptions) => void) {
    this.level = level;
    this.initialData = deepCloneData(data);
    this.initialOptions = { ...options, portalExitConfig: { ...options.portalExitConfig }, palette: { ...options.palette } };
    this.setData = setData;
    this.setOptions = setOptions;
  }
  execute = () => {
    try {
      const [data, options] = getEditorDataFromLevel(this.level);
      this.setData(data);
      this.setOptions(options);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  rollback = () => {
    this.setData(this.initialData);
    this.setOptions(this.initialOptions);
  };
}

export class ClearAllCommand implements Command {
  public readonly name = 'Clear Map';
  private initialData: EditorData;
  private setData: (val: EditorData) => void;
  public constructor(data: EditorData, setData: (val: EditorData) => void) {
    this.initialData = deepCloneData(data);
    this.setData = setData;
  }
  execute = () => {
    try {
      const newData: EditorData = {
        applesMap: {},
        barriersMap: {},
        decoratives1Map: {},
        decoratives2Map: {},
        doorsMap: {},
        keysMap: {},
        locksMap: {},
        nospawnsMap: {},
        passablesMap: {},
        portalsMap: {},
        playerSpawnPosition: new Vector(15, 15),
        startDirection: DIR.RIGHT
      };
      this.setData(newData);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  rollback = () => {
    this.setData(this.initialData);
  };
}

export class FloodFillCommand implements Command {
  public readonly name = 'Bucket Fill';

  private tile: Tile;
  private x: number;
  private y: number;
  private portalChannel: PortalChannel;
  private keyChannel: KeyChannel;
  private dataRef: React.MutableRefObject<EditorData>;
  private initialData: EditorData;
  private setData: (val: EditorData) => void;

  public constructor(
    tile: Tile,
    x: number,
    y: number,
    portalChannel: PortalChannel,
    keyChannel: KeyChannel,
    dataRef: React.MutableRefObject<EditorData>,
    setData: (val: EditorData) => void,
  ) {
    this.tile = tile;
    this.x = x;
    this.y = y;
    this.portalChannel = portalChannel;
    this.keyChannel = keyChannel;
    this.dataRef = dataRef;
    this.initialData = dataRef.current;
    this.setData = setData;
  }
  execute = () => {
    try {
      const updates = tileFloodFill(
        this.tile,
        this.x,
        this.y,
        this.portalChannel,
        this.keyChannel,
        this.dataRef.current
      );
      this.setData(mergeData(this.dataRef.current, updates));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  rollback = () => {
    this.setData(this.initialData);
  };
}
