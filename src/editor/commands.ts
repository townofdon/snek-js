
import { Vector } from "p5";
import { DIR, EditorData, EditorDataSlice, KeyChannel, PortalChannel } from "../types";
import { coordToVec, getCoordIndex, getCoordIndex2, inverseLerp, isValidKeyChannel, isValidPortalChannel, lerp } from "../utils";
import { deepCloneData, mergeData, mergeDataSlice } from "./utils/editorUtils";
import { SetStateValue } from "./editorTypes";

//  THE COMMAND PATTERN
export interface Command {
  execute: () => boolean,
  rollback: () => void,
}

export class NoOpCommand implements Command {
  execute = () => false;
  rollback = () => { };
}

// export type SetData = (setter: (prevData: EditorData) => EditorData) => void
export type SetData = (setter: SetStateValue<EditorData>) => void
export type SetLastCoordUpdated = (coord: number) => void

abstract class SetElementCommand implements Command {
  protected readonly initial: EditorDataSlice;
  protected newData: EditorDataSlice | null;
  protected readonly coord: number;
  protected readonly setData: SetData;
  public constructor(coord: number, data: EditorData, setData: SetData) {
    this.setData = setData;
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
    this.setData(prevData => mergeDataSlice(prevData, this.initial));
  };
}

export class SetPlayerSpawnCommand extends SetElementCommand {
  public constructor(coord: number, data: EditorData, setData: SetData) {
    super(coord, data, setData);
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
  public constructor(coord: number, data: EditorData, setData: SetData) {
    super(coord, data, setData);
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
  public constructor(coord: number, data: EditorData, setData: SetData) {
    super(coord, data, setData);
    if (data.applesMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.apple = true;
    }
  }
}

export class SetBarrierCommand extends SetElementCommand {
  public constructor(coord: number, data: EditorData, setData: SetData) {
    super(coord, data, setData);
    if (data.barriersMap[this.coord] && !data.passablesMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.barrier = true;
    }
  }
}

export class SetDecorative1Command extends SetElementCommand {
  public constructor(coord: number, data: EditorData, setData: SetData) {
    super(coord, data, setData);
    if (data.decoratives1Map[this.coord] && !data.nospawnsMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.deco1 = true;
    }
  }
}

export class SetDecorative2Command extends SetElementCommand {
  public constructor(coord: number, data: EditorData, setData: SetData) {
    super(coord, data, setData);
    if (data.decoratives2Map[this.coord] && !data.nospawnsMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.deco2 = true;
    }
  }
}

export class SetDoorCommand extends SetElementCommand {
  public constructor(coord: number, data: EditorData, setData: SetData) {
    super(coord, data, setData);
    if (data.doorsMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.door = true;
    }
  }
}

export class SetKeyCommand extends SetElementCommand {
  public constructor(coord: number, channel: KeyChannel, data: EditorData, setData: SetData) {
    super(coord, data, setData);
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
  public constructor(coord: number, channel: KeyChannel, data: EditorData, setData: SetData) {
    super(coord, data, setData);
    if (isValidKeyChannel(data.locksMap[this.coord]) && data.locksMap[this.coord] === channel) {
      this.newData = null;
    } else {
      this.newData.lock = channel;
    }
  }
}

export class SetNospawnCommand extends SetElementCommand {
  public constructor(coord: number, data: EditorData, setData: SetData) {
    super(coord, data, setData);
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
  public constructor(coord: number, data: EditorData, setData: SetData) {
    super(coord, data, setData);
    if (data.passablesMap[this.coord] || !data.barriersMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.barrier = true;
      this.newData.passable = true;
    }
  }
}

export class SetPortalCommand extends SetElementCommand {
  public constructor(coord: number, channel: PortalChannel, data: EditorData, setData: SetData) {
    super(coord, data, setData);
    if (isValidPortalChannel(data.portalsMap[this.coord]) && data.portalsMap[this.coord] === channel) {
      this.newData = null;
    } else {
      this.newData.portal = channel;
    }
  }
}

// TODO: GET BATCH UPDATE WORKING FOR RECTANGLE FILL
abstract class SetBatchElementsCommand implements Command {
  protected readonly dataRef: React.MutableRefObject<EditorData>;
  protected prevData: EditorData | undefined;
  protected newData: EditorDataSlice | null;
  protected readonly coords: number[];
  protected readonly setData: SetData;
  protected readonly setLastCoordUpdated: SetLastCoordUpdated | undefined;
  public constructor(coords: number[], dataRef: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    this.setData = setData;
    this.setLastCoordUpdated = setLastCoordUpdated;
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
    }
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
      updates = mergeDataSlice(updates, this.newData, this.coords[i]);
      shouldUpdate = true;
    }
    if (!shouldUpdate) {
      return false;
    }
    this.setData(mergeData(this.dataRef.current, updates));
    return true;
  };
  rollback = () => {
    if (!this.prevData) return;
    if (this.setLastCoordUpdated && this.coords.length) {
      this.setLastCoordUpdated(this.coords[0]);
    }
    this.setData(mergeData(this.dataRef.current, this.prevData));
  };
  protected abstract test: (coord: number) => boolean;
}

interface SetLineOptions {
  thickLine?: false,
}

abstract class SetLineCommand extends SetBatchElementsCommand {
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated, opts: SetLineOptions = {}) {
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
    super(coords, data, setData, setLastCoordUpdated);
  }
}

abstract class SetRectangleCommand extends SetBatchElementsCommand {
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
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
    super(coords, data, setData, setLastCoordUpdated);
  }
}

export class DeleteLineCommand extends SetLineCommand {
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
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
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
    this.newData.apple = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.applesMap[coord];
  };
}

export class SetLineBarrierCommand extends SetLineCommand {
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
    this.newData.barrier = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.barriersMap[coord];
  };
}

export class SetLineDeco1Command extends SetLineCommand {
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
    this.newData.deco1 = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.decoratives1Map[coord];
  };
}

export class SetLineDeco2Command extends SetLineCommand {
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
    this.newData.deco2 = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.decoratives2Map[coord];
  };
}

export class SetLineDoorCommand extends SetLineCommand {
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
    this.newData.door = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.doorsMap[coord];
  };
}

export class SetLineKeyCommand extends SetLineCommand {
  private channel: KeyChannel;
  public constructor(from: number, to: number, channel: KeyChannel, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
    this.channel = channel;
    this.newData.key = channel;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.keysMap[coord] !== this.channel;
  };
}

export class SetLineLockCommand extends SetLineCommand {
  private channel: KeyChannel;
  public constructor(from: number, to: number, channel: KeyChannel, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
    this.channel = channel;
    this.newData.lock = channel;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.keysMap[coord] !== this.channel;
  };
}

export class SetLineNospawnCommand extends SetLineCommand {
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
    this.newData.nospawn = true;
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
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
    this.newData.passable = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.passablesMap[coord] && this.dataRef.current.barriersMap[coord];
  };
}

export class SetLinePortalCommand extends SetLineCommand {
  private channel: PortalChannel;
  public constructor(from: number, to: number, channel: PortalChannel, data: React.MutableRefObject<EditorData>, setData: SetData, setLastCoordUpdated: SetLastCoordUpdated | undefined) {
    super(from, to, data, setData, setLastCoordUpdated);
    this.channel = channel;
    this.newData.portal = channel;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.keysMap[coord] !== this.channel;
  };
}
