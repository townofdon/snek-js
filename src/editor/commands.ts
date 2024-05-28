
import { Vector } from "p5";
import { DIR, EditorData, EditorDataSlice, KeyChannel, PortalChannel } from "../types";
import { coordToVec, getCoordIndex, isValidKeyChannel, isValidPortalChannel } from "../utils";
import { mergeData, mergeDataSlice } from "./utils/editorUtils";

//  THE COMMAND PATTERN
export interface Command {
  execute: () => boolean,
  rollback: () => void,
}

export class NoOpCommand implements Command {
  execute = () => false;
  rollback = () => { };
}

export type SetData = (setter: (prevData: EditorData) => EditorData) => void

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
  protected readonly initial: EditorData;
  protected newData: EditorDataSlice | null;
  protected readonly coords: number[];
  protected readonly setData: SetData;
  public constructor(coords: number[], data: EditorData, setData: SetData) {
    this.setData = setData;
    this.coords = coords;
    this.initial = {
      applesMap: data.applesMap,
      barriersMap: data.barriersMap,
      decoratives1Map: data.decoratives1Map,
      decoratives2Map: data.decoratives2Map,
      doorsMap: data.doorsMap,
      keysMap: data.keysMap,
      locksMap: data.locksMap,
      nospawnsMap: data.nospawnsMap,
      passablesMap: data.passablesMap,
      portalsMap: data.portalsMap,
      playerSpawnPosition: data.playerSpawnPosition.copy(),
      startDirection: data.startDirection,
    };
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
      playerSpawnPosition: new Vector(15, 15),
      startDirection: DIR.RIGHT,
    }
  }
  execute = () => {
    if (!this.newData) {
      return false;
    }
    // this.setData(prevData => mergeDataSlice(prevData, this.newData));
    return true;
  };
  rollback = () => {
    this.setData(prevData => mergeData(prevData, this.initial));
  };
}