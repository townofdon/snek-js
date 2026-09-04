import { Vector } from "p5";

import { MapSaveData, SetStateValue, Tile } from "./editorTypes";
import {
  BarrierType,
  DIR,
  EditorData,
  EditorDataSlice,
  EditorOptions,
  KeyChannel,
  Level,
  MapAnnotation,
  Palette,
  PickupType,
  PipeConnection,
  PipeVariant,
  PortalChannel,
  SwitchType,
  ThreatType,
} from "../types";
import {
  coordToVec,
  getCoordIndex,
  getCoordIndex2,
  inverseLerp,
  isValidBarrierType,
  isValidKeyChannel,
  isValidPortalChannel,
  isValidSwitchType,
  isValidThreatType,
  lerp,
  outOfBounds,
  remap,
} from "../utils";
import {
  decodeMapData,
  deepCloneData,
  getDataSliceAtCoord,
  getEditorDataFromLevel,
  mergeData,
  mergeDataSlice,
} from "./utils/editorUtils";
import { tileFloodFill } from "./utils/floodFill";
import { Operation } from "./editorSketch";
import { GRIDCOUNT_X, GRIDCOUNT_Y, IS_LOCALHOST } from "@/constants";
import { EDITOR_DEFAULTS } from "./editorConstants";

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

export type SetData = (setter: SetStateValue<EditorData>) => void;
export type SetSelected = (setter: SetStateValue<Record<number, boolean>>) => void;
export type RollbackLastCoordUpdated = () => void;

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
      threat: data.threatsMap[this.coord],
      pickup: data.pickupsMap[this.coord],
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
      switch: data.switchesMap[this.coord],
      pipe: data.pipesMap[this.coord],
      annotation: data.annotations[this.coord],
      pipeOverride: data.pipeOverrides[this.coord],
    } satisfies EditorDataSlice;
    this.newData = {
      ...EDITOR_DEFAULTS.dataSlice,
      coord: this.coord,
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
      this.newData = {
        playerSpawnPosition: coordToVec(coord),
        coord: coord,
        apple: data.applesMap[coord],
        pipe: data.pipesMap[coord],
        barrier: data.barriersMap[coord],
        deco1: data.decoratives1Map[coord],
        deco2: data.decoratives2Map[coord],
        door: data.doorsMap[coord],
        key: data.keysMap[coord],
        lock: data.locksMap[coord],
        nospawn: data.nospawnsMap[coord],
        passable: data.passablesMap[coord],
        portal: data.portalsMap[coord],
        pickup: data.pickupsMap[coord],
        switch: data.switchesMap[coord],
        threat: data.threatsMap[coord],
        annotation: data.annotations[coord],
        pipeOverride: data.pipeOverrides[coord],
        startDirection: data.startDirection,
      } satisfies EditorDataSlice;
    }
  }
}

export class DeleteElementCommand extends SetElementCommand {
  public readonly name = 'Erase';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (
      !data.applesMap[this.coord] &&
      !data.threatsMap[this.coord] &&
      !data.pickupsMap[this.coord] &&
      !data.pipesMap[this.coord] &&
      !data.barriersMap[this.coord] &&
      !data.decoratives1Map[this.coord] &&
      !data.decoratives2Map[this.coord] &&
      !data.doorsMap[this.coord] &&
      !isValidKeyChannel(data.keysMap[this.coord]) &&
      !isValidKeyChannel(data.locksMap[this.coord]) &&
      !data.nospawnsMap[this.coord] &&
      !data.passablesMap[this.coord] &&
      !data.switchesMap[this.coord] &&
      !data.annotations[this.coord] &&
      !data.pipeOverrides[this.coord] &&
      !isValidPortalChannel(data.portalsMap[this.coord])
    ) {
      this.newData = null;
    }
  }
}

export class DeleteAnnotationCommand extends DeleteElementCommand {
  public readonly name = 'Erase';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (this.newData) {
      this.newData = getDataSliceAtCoord(data, coord);
      this.newData.annotation = 0;
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

export class SetThreatCommand extends SetElementCommand {
  public readonly name = 'Draw Threat';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, threatType: ThreatType) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (isValidThreatType(data.threatsMap[this.coord]) && data.threatsMap[this.coord] === threatType && !data.passablesMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.threat = threatType;
    }
  }
}

export class SetSwitchCommand extends SetElementCommand {
  public readonly name = 'Draw Switch';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, switchType: SwitchType) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (isValidSwitchType(data.switchesMap[this.coord]) && data.switchesMap[this.coord] === switchType && !data.passablesMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.switch = switchType;
    }
  }
}

export class SetPipeCommand extends SetElementCommand {
  public readonly name = 'Draw Pipe';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.pipesMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.pipe = true;
    }
  }
}

export class SetInvincibilityCommand extends SetElementCommand {
  public readonly name = 'Draw Invincibility';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.pickupsMap[this.coord] === PickupType.Invincibility) {
      this.newData = null;
    } else {
      this.newData.pickup = PickupType.Invincibility;
    }
  }
}

export class SetReversibilityCommand extends SetElementCommand {
  public readonly name = 'Draw Reversibility';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.pickupsMap[this.coord] === PickupType.Reversibility) {
      this.newData = null;
    } else {
      this.newData.pickup = PickupType.Reversibility;
    }
  }
}

export class SetArmorCommand extends SetElementCommand {
  public readonly name = 'Draw Armor';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.pickupsMap[this.coord] === PickupType.Armor) {
      this.newData = null;
    } else {
      this.newData.pickup = PickupType.Armor;
    }
  }
}

export class SetBarrierCommand extends SetElementCommand {
  public readonly name = 'Draw Barrier';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, barrierType: BarrierType) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (isValidBarrierType(data.barriersMap[this.coord]) && data.barriersMap[this.coord] === barrierType && !data.passablesMap[this.coord]) {
      this.newData = null;
    } else {
      this.newData.barrier = barrierType;
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
        this.newData.barrier = BarrierType.Default;
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
      this.newData.barrier = BarrierType.Default;
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

export class SetAnnotationCommand extends SetElementCommand {
  public readonly name = 'Draw Annotation';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, annotation: MapAnnotation) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.annotations[this.coord] && data.annotations[this.coord] === annotation) {
      this.newData = null;
    } else {
      this.newData = { ...this.initial };
      this.newData.annotation = annotation;
    }
  }
}

export class SetPipeOverrideCommand extends SetElementCommand {
  public readonly name = 'Draw Pipe';
  public constructor(coord: number, data: EditorData, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, pipeOverride: PipeConnection) {
    super(coord, data, setData, rollbackLastCoordUpdated);
    if (data.pipesMap[this.coord] && data.pipeOverrides[this.coord] === pipeOverride) {
      this.newData = null;
    } else {
      this.newData.pipe = true;
      this.newData.pipeOverride = pipeOverride;
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
      ...EDITOR_DEFAULTS.dataSlice,
      coord: -1,
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
    let updates: EditorData = deepCloneData(this.dataRef.current);
    for (let i = 0; i < this.coords.length; i++) {
      if (!this.test(this.coords[i])) continue;
      updates = mergeDataSlice(updates, { ...this.newData, ...this.resolveNewData(this.coords[i]) }, this.coords[i]);
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
  /**
   * Determine whether the command should be executed.
   */
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
      !!this.dataRef.current.threatsMap[coord] ||
      !!this.dataRef.current.pickupsMap[coord] ||
      !!this.dataRef.current.pipesMap[coord] ||
      !!this.dataRef.current.switchesMap ||
      !!this.dataRef.current.barriersMap[coord] ||
      this.dataRef.current.decoratives1Map[coord] ||
      this.dataRef.current.decoratives2Map[coord] ||
      this.dataRef.current.doorsMap[coord] ||
      isValidKeyChannel(this.dataRef.current.keysMap[coord]) ||
      isValidKeyChannel(this.dataRef.current.locksMap[coord]) ||
      this.dataRef.current.nospawnsMap[coord] ||
      this.dataRef.current.passablesMap[coord] ||
      isValidPortalChannel(this.dataRef.current.portalsMap[coord]) ||
      !!this.dataRef.current.annotations[coord] ||
      !!this.dataRef.current.pipeOverrides[coord]
    );
  };
}

export class DeleteLineAnnotationCommand extends DeleteLineCommand {
  public readonly name = 'Erase';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.annotation = 0;
    this.resolveNewData = (coord) => {
      const newData = getDataSliceAtCoord(this.dataRef.current, coord);
      newData.annotation = 0;
      return newData;
    }
  }
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

export class SetLinePipeCommand extends SetLineCommand {
  public readonly name = 'Draw Pipe';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.pipe = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.pipesMap[coord];
  };
}

export class SetLineThreatCommand extends SetLineCommand {
  public readonly name = 'Draw Threat';
  private threatType: ThreatType;
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined, threatType: ThreatType) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.threat = threatType;
    this.threatType = threatType;
  }
  protected test = (coord: number) => {
    return false
      ||!this.dataRef.current.threatsMap[coord]
      || this.dataRef.current.threatsMap[coord] !== this.threatType;
  };
}

export class SetLineSwitchCommand extends SetLineCommand {
  public readonly name = 'Draw Switch';
  private switchType: SwitchType;
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined, switchType: SwitchType) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.switch = switchType;
    this.switchType = switchType;
  }
  protected test = (coord: number) => {
    return false
      ||!this.dataRef.current.switchesMap[coord]
      || this.dataRef.current.switchesMap[coord] !== this.switchType;
  };
}

export class SetLineInvincibilityCommand extends SetLineCommand {
  public readonly name = 'Draw Invincibility';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.pickup = PickupType.Invincibility;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.pickupsMap[coord] !== PickupType.Invincibility;
  };
}

export class SetLineReversibilityCommand extends SetLineCommand {
  public readonly name = 'Draw Reversibility';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.pickup = PickupType.Reversibility;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.pickupsMap[coord] !== PickupType.Reversibility;
  };
}

export class SetLineArmorCommand extends SetLineCommand {
  public readonly name = 'Draw Armor';
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.pickup = PickupType.Armor;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.pickupsMap[coord] !== PickupType.Armor;
  };
}

export class SetLineBarrierCommand extends SetLineCommand {
  public readonly name = 'Draw Barrier';
  private barrierType: BarrierType;
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined, barrierType: BarrierType) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.newData.barrier = barrierType;
    this.barrierType = barrierType;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.barriersMap[coord]
      || this.dataRef.current.barriersMap[coord] !== this.barrierType
      || this.dataRef.current.passablesMap[coord];
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
        newData.barrier = BarrierType.Default;
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
    this.newData.barrier = BarrierType.Default;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.passablesMap[coord] || !this.dataRef.current.barriersMap[coord];
  };
}

export class SetLinePortalCommand extends SetLineCommand {
  public readonly name = 'Draw Portal';
  private readonly channel: PortalChannel;
  public constructor(from: number, to: number, channel: PortalChannel, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.channel = channel;
    this.newData.portal = channel;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.portalsMap[coord] !== this.channel;
  };
}

export class SetLineAnnotationCommand extends SetLineCommand {
  public readonly name = 'Draw Annotation';
  private readonly annotation: MapAnnotation;
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined, annotation: MapAnnotation) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.annotation = annotation;
    this.newData.annotation = annotation;
    this.resolveNewData = (coord: number) => {
      const newData = getDataSliceAtCoord(this.prevData, coord);
      newData.annotation = this.annotation;
      return newData;
    };
  }
  protected test = (coord: number) => {
    return this.dataRef.current.annotations[coord] !== this.annotation;
  };
}

export class SetLinePipeOverrideCommand extends SetLineCommand {
  public readonly name = 'Draw Pipe';
  private readonly pipeOverride: PipeConnection;
  public constructor(from: number, to: number, data: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated | undefined, pipeOverride: PipeConnection) {
    super(from, to, data, setData, rollbackLastCoordUpdated);
    this.pipeOverride = pipeOverride;
    this.newData.pipe = true;
    this.newData.pipeOverride = pipeOverride;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.pipesMap[coord] || this.dataRef.current.pipeOverrides[coord] !== this.pipeOverride;
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
      !!this.dataRef.current.threatsMap[coord] ||
      !!this.dataRef.current.pickupsMap ||
      !!this.dataRef.current.pipesMap ||
      !!this.dataRef.current.switchesMap ||
      !!this.dataRef.current.barriersMap[coord] ||
      this.dataRef.current.decoratives1Map[coord] ||
      this.dataRef.current.decoratives2Map[coord] ||
      this.dataRef.current.doorsMap[coord] ||
      isValidKeyChannel(this.dataRef.current.keysMap[coord]) ||
      isValidKeyChannel(this.dataRef.current.locksMap[coord]) ||
      this.dataRef.current.nospawnsMap[coord] ||
      this.dataRef.current.passablesMap[coord] ||
      isValidPortalChannel(this.dataRef.current.portalsMap[coord]) ||
      !!this.dataRef.current.annotations[coord] ||
      !!this.dataRef.current.pipeOverrides[coord]
    );
  };
}

export class DeleteRectangleAnnotationCommand extends DeleteRectangleCommand {
  public readonly name = 'Erase';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.annotation = 0;
    this.resolveNewData = (coord) => {
      const newData = getDataSliceAtCoord(this.dataRef.current, coord);
      newData.annotation = 0;
      return newData;
    }
  }
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

export class SetRectanglePipeCommand extends SetRectangleCommand {
  public readonly name = 'Draw Pipe';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.pipe = true;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.pipesMap[coord];
  };
}

export class SetRectangleThreatCommand extends SetRectangleCommand {
  public readonly name = 'Draw Threat';
  private threatType: ThreatType;
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, threatType: ThreatType) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.threat = threatType;
    this.threatType = threatType;
  }
  protected test = (coord: number) => {
    return false
      ||!this.dataRef.current.threatsMap[coord]
      || this.dataRef.current.threatsMap[coord] !== this.threatType;
  };
}

export class SetRectangleSwitchCommand extends SetRectangleCommand {
  public readonly name = 'Draw Switch';
  private switchType: SwitchType;
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, switchType: SwitchType) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.switch = switchType;
    this.switchType = switchType;
  }
  protected test = (coord: number) => {
    return false
      ||!this.dataRef.current.switchesMap[coord]
      || this.dataRef.current.switchesMap[coord] !== this.switchType;
  };
}

export class SetRectangleInvincibilityCommand extends SetRectangleCommand {
  public readonly name = 'Draw Invincibility';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.pickup = PickupType.Invincibility;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.pickupsMap[coord] !== PickupType.Invincibility;
  };
}

export class SetRectangleReversibilityCommand extends SetRectangleCommand {
  public readonly name = 'Draw Reversibility';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.pickup = PickupType.Reversibility;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.pickupsMap[coord] !== PickupType.Reversibility;
  };
}

export class SetRectangleArmorCommand extends SetRectangleCommand {
  public readonly name = 'Draw Armor';
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.pickup = PickupType.Armor;
  }
  protected test = (coord: number) => {
    return this.dataRef.current.pickupsMap[coord] !== PickupType.Armor;
  };
}

export class SetRectangleBarrierCommand extends SetRectangleCommand {
  public readonly name = 'Draw Barrier';
  private barrierType: BarrierType;
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, barrierType: BarrierType) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.newData.barrier = barrierType;
    this.barrierType = barrierType;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.barriersMap[coord]
      || this.dataRef.current.barriersMap[coord] !== this.barrierType
      || this.dataRef.current.passablesMap[coord];
  }
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
        newData.barrier = BarrierType.Default;
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
    this.newData.barrier = BarrierType.Default;
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

export class SetRectangleAnnotationCommand extends SetRectangleCommand {
  public readonly name = 'Draw Annotation';
  private readonly annotation: MapAnnotation;
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, annotation: MapAnnotation) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.annotation = annotation;
    this.newData.annotation = annotation;
    this.resolveNewData = (coord: number) => {
      const newData = getDataSliceAtCoord(this.prevData, coord);
      newData.annotation = this.annotation;
      return newData;
    };
  }
  protected test = (coord: number) => {
    return this.dataRef.current.annotations[coord] !== this.annotation;
  };
}

export class SetRectanglePipeOverrideCommand extends SetRectangleCommand {
  public readonly name = 'Draw Pipe';
  private readonly pipeOverride: PipeConnection;
  public constructor(from: number, to: number, dataRef: React.MutableRefObject<EditorData>, setData: SetData, rollbackLastCoordUpdated: RollbackLastCoordUpdated, pipeOverride: PipeConnection) {
    super(from, to, dataRef, setData, rollbackLastCoordUpdated);
    this.pipeOverride = pipeOverride;
    this.newData.pipe = true;
    this.newData.pipeOverride = pipeOverride;
  }
  protected test = (coord: number) => {
    return !this.dataRef.current.pipesMap[coord] || this.dataRef.current.pipeOverrides[coord] !== this.pipeOverride;
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

export class SetPipeVariantCommand implements Command {
  public readonly name = 'Set Pipe Variant';
  private newValue: PipeVariant;
  private initial: PipeVariant;
  private optionsRef: React.MutableRefObject<EditorOptions>;
  private setOptions: (val: EditorOptions) => void;
  public constructor(newPalette: PipeVariant, optionsRef: React.MutableRefObject<EditorOptions>, setOptions: (val: EditorOptions) => void) {
    this.newValue = newPalette;
    this.optionsRef = optionsRef;
    this.setOptions = setOptions;
    this.initial = optionsRef.current.pipeVariant;
  }
  execute = () => {
    this.setOptions({ ...this.optionsRef.current, pipeVariant: this.newValue });
    return true;
  };
  rollback = () => {
    this.setOptions({ ...this.optionsRef.current, pipeVariant: this.initial });
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

export class ImportMapDataCommand implements Command {
  public readonly name = 'Import Map';
  private mapSaveData: MapSaveData;
  private initialData: EditorData;
  private initialOptions: EditorOptions;
  private setData: (val: EditorData) => void;
  private setOptions: (val: EditorOptions) => void;
  public constructor(mapSaveData: MapSaveData, data: EditorData, options: EditorOptions, setData: (val: EditorData) => void, setOptions: (val: EditorOptions) => void) {
    this.mapSaveData = mapSaveData;
    this.initialData = deepCloneData(data);
    this.initialOptions = { ...options, portalExitConfig: { ...options.portalExitConfig }, palette: { ...options.palette } };
    this.setData = setData;
    this.setOptions = setOptions;
  }
  execute = () => {
    try {
      const [data, options] = decodeMapData(this.mapSaveData.mapData);
      this.setData(data);
      this.setOptions({
        name: this.mapSaveData.name,
        ...options,
      });
      // this.setMetadata({ author: this.mapSaveData.author, id: this.mapSaveData.id });
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
        ...deepCloneData(EDITOR_DEFAULTS.data),
        barriersMap: {},
        decoratives1Map: {},
        decoratives2Map: {},
        doorsMap: {},
        playerSpawnPosition: new Vector(15, 15),
        startDirection: DIR.RIGHT,
      } satisfies EditorData;
      console.log({ newData });
      console.log({ defaults: EDITOR_DEFAULTS.data });
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
  private barrierType: BarrierType;
  private threatType: ThreatType;
  private switchType: SwitchType;
  private dataRef: React.MutableRefObject<EditorData>;
  private initialData: EditorData;
  private setData: (val: EditorData) => void;

  public constructor(
    tile: Tile,
    x: number,
    y: number,
    portalChannel: PortalChannel,
    keyChannel: KeyChannel,
    barrierType: BarrierType,
    threatType: ThreatType,
    switchType: SwitchType,
    dataRef: React.MutableRefObject<EditorData>,
    setData: (val: EditorData) => void,
  ) {
    this.tile = tile;
    this.x = x;
    this.y = y;
    this.portalChannel = portalChannel;
    this.keyChannel = keyChannel;
    this.barrierType = barrierType;
    this.threatType = threatType;
    this.switchType = switchType;
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
        this.barrierType,
        this.threatType,
        this.switchType,
        this.dataRef.current
      );
      if (!updates) {
        return false;
      }
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

export class FloodFillEmptyCommand extends FloodFillCommand {
  public readonly name = 'Bucket Fill';

  public constructor(
    x: number,
    y: number,
    dataRef: React.MutableRefObject<EditorData>,
    setData: (val: EditorData) => void,
  ) {
    super(Tile.None, x, y, 0, 0, 0, 0, 0, dataRef, setData);
  }
}

export class SetSelectedCommand implements Command {
  public readonly name = "Set Selection";
  private readonly initial: Record<number, boolean>;
  private readonly newData: Record<number, boolean>;
  private readonly setSelected: SetSelected;
  private readonly onRollback: RollbackLastCoordUpdated;
  public constructor(from: number, to: number, selected: Record<number, boolean>, operation: Operation, setSelected: SetSelected, onRollback: RollbackLastCoordUpdated) {
    this.setSelected = setSelected;
    this.onRollback = onRollback;
    this.initial = { ...selected };
    if (operation === Operation.None) {
      this.newData = null;
      return;
    }
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
    if (operation === Operation.Add) {
      this.newData = { ...selected };
      coords.forEach(coord => {
        this.newData[coord] = true;
      });
    } else if (operation === Operation.Remove) {
      this.newData = { ...selected };
      coords.forEach(coord => {
        this.newData[coord] = false;
      });
    } else if (operation === Operation.Write) {
      this.newData = {};
      coords.forEach(coord => {
        this.newData[coord] = true;
      });
    }
  }
  execute = () => {
    if (!this.newData) {
      return false;
    }
    this.setSelected(this.newData);
    return true;
  };
  rollback = () => {
    this.onRollback();
    this.setSelected(this.initial);
  };
}

export class ClearSelectedCommand implements Command {
  public readonly name = 'Clear Selection';
  private initialData: Record<number, boolean>;
  private setSelected: SetSelected;
  private readonly onRollback: RollbackLastCoordUpdated | undefined;
  public constructor(selected: Record<number, boolean>, setSelected: SetSelected, onRollback?: RollbackLastCoordUpdated | undefined) {
    this.initialData = { ...selected };
    this.onRollback = onRollback;
    this.setSelected = setSelected;
  }
  execute = () => {
    this.setSelected({});
    return true;
  };
  rollback = () => {
    this.onRollback?.();
    this.setSelected(this.initialData);
  };
}

export class MoveTilesCommand implements Command {
  public readonly name = "Move Tiles";
  private readonly prevSelected: Record<number, boolean>;
  private readonly newSelected: Record<number, boolean>;
  private readonly prevData: EditorData;
  private newData: EditorData;
  private readonly setData: SetData;
  private readonly setSelected: SetSelected;
  private readonly onRollback: RollbackLastCoordUpdated;
  public constructor(
    from: number,
    to: number,
    currentSelected: Record<number, boolean>,
    data: EditorData,
    operation: Operation,
    setSelected: SetSelected,
    setData: SetData,
    onRollback: RollbackLastCoordUpdated,
  ) {
    this.setSelected = setSelected;
    this.setData = setData;
    this.onRollback = onRollback;
    this.prevSelected = { ...currentSelected };
    this.newSelected = {};
    this.prevData = deepCloneData(data);
    this.newData = deepCloneData(data);
    if (operation === Operation.None) return this.invalidCommand("operation invalid: None");
    if (operation === Operation.Remove) return this.invalidCommand("operation invalid: Remove");
    if (from === to) return this.noop();
    if (from < 0) return this.noop();
    if (to < 0) return this.noop();
    const translate = coordToVec(to).sub(coordToVec(from));
    // compute selected
    const anySelected = Object.keys(currentSelected).some(key => !!currentSelected[key]);
    const selected = anySelected ? { ...currentSelected } : { [from]: true };
    if (anySelected) {
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);
          if (!currentSelected[coord]) {
            continue;
          }
          const tx = x + translate.x;
          const ty = y + translate.y;
          if (outOfBounds(tx, ty)) {
            continue;
          }
          const transcoord = getCoordIndex2(tx, ty);
          this.newSelected[transcoord] = currentSelected[coord];
        }
      }
    } else {
      this.newSelected = {};
    }
    // clear source
    if (operation == Operation.Write) {
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);
          if (!selected[coord]) {
            continue;
          }
          const emptySlice: EditorDataSlice = {
            ...EDITOR_DEFAULTS.dataSlice,
            coord,
            playerSpawnPosition: data.playerSpawnPosition.copy(),
            startDirection: data.startDirection,
          };
          this.newData = mergeDataSlice(this.newData, emptySlice, coord);
        }
      }
    }
    // set destination
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        if (!selected[coord]) {
          continue;
        }
        const tx = x + translate.x;
        const ty = y + translate.y;
        if (outOfBounds(tx, ty)) {
          continue;
        }
        const transcoord = getCoordIndex2(tx, ty);
        this.newData = mergeDataSlice(this.newData, getDataSliceAtCoord(data, coord), transcoord);
      }
    }
  }
  private invalidCommand = (msg: string) => {
    this.newData = null;
    if (IS_LOCALHOST) throw new Error('[MoveTilesCommand] ' + msg);
    console.error('[MoveTilesCommand] ' + msg);
    return this;
  }
  private noop = () => {
    this.newData = null;
    return this;
  }
  execute = () => {
    if (!this.newData) {
      return false;
    }
    this.setData(this.newData);
    this.setSelected(this.newSelected);
    return true;
  };
  rollback = () => {
    this.onRollback();
    this.setSelected(this.prevSelected);
    this.setData(this.prevData);
  };
}
