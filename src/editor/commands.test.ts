import { Vector } from "p5";
import { expect } from "expect";

import { DIR, EditorData, KeyChannel } from "../types";
import { SetAppleCommand, SetBarrierCommand, SetDecorative1Command, SetKeyCommand, SetNospawnCommand, SetPassableCommand } from "./commands";
import { getCoordIndex2 } from "../utils";

describe('commands', () => {
  const getTestData = (overrides: Partial<EditorData> = {}): EditorData => {
    const data: EditorData = {
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
      startDirection: DIR.UP
    };
    return { ...data, ...overrides }
  };
  describe('SetAppleCommand', () => {
    it('should set apples and unset barriers', () => {
      let data: EditorData = getTestData({
        barriersMap: {
          [getCoordIndex2(10, 10)]: true,
        },
      });
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const command = new SetAppleCommand(getCoordIndex2(10, 10), data, setData, () => { });
      const res = command.execute();
      expect(res).toEqual(true);
      expect(data.applesMap).toEqual({ [getCoordIndex2(10, 10)]: true });
      expect(data.barriersMap).toEqual({ [getCoordIndex2(10, 10)]: false });
      command.rollback();
      expect(data.applesMap).toEqual({ [getCoordIndex2(10, 10)]: undefined });
      expect(data.barriersMap).toEqual({ [getCoordIndex2(10, 10)]: true });
    });
    it('should set apples and unset decoratives1', () => {
      let data: EditorData = getTestData({
        decoratives1Map: {
          [getCoordIndex2(11, 11)]: true,
        },
      });
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const command = new SetAppleCommand(getCoordIndex2(11, 11), data, setData, () => { });
      const res = command.execute();
      expect(res).toEqual(true);
      expect(data.applesMap).toEqual({ [getCoordIndex2(11, 11)]: true });
      expect(data.decoratives1Map).toEqual({ [getCoordIndex2(11, 11)]: false });
      command.rollback();
      expect(data.applesMap).toEqual({ [getCoordIndex2(11, 11)]: undefined });
      expect(data.decoratives1Map).toEqual({ [getCoordIndex2(11, 11)]: true });
    });
    it('should set and unset multiple cells', () => {
      let data: EditorData = getTestData();
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const commands = [
        new SetBarrierCommand(getCoordIndex2(1, 1), data, setData, () => { }),
        new SetBarrierCommand(getCoordIndex2(2, 2), data, setData, () => { }),
        new SetBarrierCommand(getCoordIndex2(3, 3), data, setData, () => { }),
        new SetBarrierCommand(getCoordIndex2(4, 4), data, setData, () => { }),
        new SetAppleCommand(getCoordIndex2(5, 5), data, setData, () => { }),
        new SetAppleCommand(getCoordIndex2(6, 6), data, setData, () => { }),
        new SetAppleCommand(getCoordIndex2(7, 7), data, setData, () => { }),
        new SetAppleCommand(getCoordIndex2(8, 8), data, setData, () => { }),
        new SetDecorative1Command(getCoordIndex2(9, 9), data, setData, () => { }),
        new SetDecorative1Command(getCoordIndex2(10, 10), data, setData, () => { }),
        new SetDecorative1Command(getCoordIndex2(11, 11), data, setData, () => { }),
        new SetDecorative1Command(getCoordIndex2(12, 12), data, setData, () => { }),
      ];
      const results = commands.map(command => command.execute());
      expect(results).toEqual(Array.from({ length: commands.length }, () => true));
      expect(data.barriersMap).toEqual({
        [getCoordIndex2(1, 1)]: true,
        [getCoordIndex2(2, 2)]: true,
        [getCoordIndex2(3, 3)]: true,
        [getCoordIndex2(4, 4)]: true,
        [getCoordIndex2(5, 5)]: false,
        [getCoordIndex2(6, 6)]: false,
        [getCoordIndex2(7, 7)]: false,
        [getCoordIndex2(8, 8)]: false,
        [getCoordIndex2(9, 9)]: false,
        [getCoordIndex2(10, 10)]: false,
        [getCoordIndex2(11, 11)]: false,
        [getCoordIndex2(12, 12)]: false,
      });
      expect(data.applesMap).toEqual({
        [getCoordIndex2(1, 1)]: false,
        [getCoordIndex2(2, 2)]: false,
        [getCoordIndex2(3, 3)]: false,
        [getCoordIndex2(4, 4)]: false,
        [getCoordIndex2(5, 5)]: true,
        [getCoordIndex2(6, 6)]: true,
        [getCoordIndex2(7, 7)]: true,
        [getCoordIndex2(8, 8)]: true,
        [getCoordIndex2(9, 9)]: false,
        [getCoordIndex2(10, 10)]: false,
        [getCoordIndex2(11, 11)]: false,
        [getCoordIndex2(12, 12)]: false,
      });
      expect(data.decoratives1Map).toEqual({
        [getCoordIndex2(1, 1)]: false,
        [getCoordIndex2(2, 2)]: false,
        [getCoordIndex2(3, 3)]: false,
        [getCoordIndex2(4, 4)]: false,
        [getCoordIndex2(5, 5)]: false,
        [getCoordIndex2(6, 6)]: false,
        [getCoordIndex2(7, 7)]: false,
        [getCoordIndex2(8, 8)]: false,
        [getCoordIndex2(9, 9)]: true,
        [getCoordIndex2(10, 10)]: true,
        [getCoordIndex2(11, 11)]: true,
        [getCoordIndex2(12, 12)]: true,
      });
      commands.forEach(command => command.rollback());
      expect(data.barriersMap).toEqual({
        [getCoordIndex2(1, 1)]: undefined,
        [getCoordIndex2(2, 2)]: undefined,
        [getCoordIndex2(3, 3)]: undefined,
        [getCoordIndex2(4, 4)]: undefined,
        [getCoordIndex2(5, 5)]: undefined,
        [getCoordIndex2(6, 6)]: undefined,
        [getCoordIndex2(7, 7)]: undefined,
        [getCoordIndex2(8, 8)]: undefined,
        [getCoordIndex2(9, 9)]: undefined,
        [getCoordIndex2(10, 10)]: undefined,
        [getCoordIndex2(11, 11)]: undefined,
        [getCoordIndex2(12, 12)]: undefined,
      });
      expect(data.applesMap).toEqual({
        [getCoordIndex2(1, 1)]: undefined,
        [getCoordIndex2(2, 2)]: undefined,
        [getCoordIndex2(3, 3)]: undefined,
        [getCoordIndex2(4, 4)]: undefined,
        [getCoordIndex2(5, 5)]: undefined,
        [getCoordIndex2(6, 6)]: undefined,
        [getCoordIndex2(7, 7)]: undefined,
        [getCoordIndex2(8, 8)]: undefined,
        [getCoordIndex2(9, 9)]: undefined,
        [getCoordIndex2(10, 10)]: undefined,
        [getCoordIndex2(11, 11)]: undefined,
        [getCoordIndex2(12, 12)]: undefined,
      });
      expect(data.decoratives1Map).toEqual({
        [getCoordIndex2(1, 1)]: undefined,
        [getCoordIndex2(2, 2)]: undefined,
        [getCoordIndex2(3, 3)]: undefined,
        [getCoordIndex2(4, 4)]: undefined,
        [getCoordIndex2(5, 5)]: undefined,
        [getCoordIndex2(6, 6)]: undefined,
        [getCoordIndex2(7, 7)]: undefined,
        [getCoordIndex2(8, 8)]: undefined,
        [getCoordIndex2(9, 9)]: undefined,
        [getCoordIndex2(10, 10)]: undefined,
        [getCoordIndex2(11, 11)]: undefined,
        [getCoordIndex2(12, 12)]: undefined,
      });
    });
  });
  describe('SetBarriersCommand', () => {
    it('should set barriers and unset portals', () => {
      let data: EditorData = getTestData({
        portalsMap: {
          [getCoordIndex2(25, 25)]: 5,
        },
      });
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const command = new SetBarrierCommand(getCoordIndex2(25, 25), data, setData, () => { });
      const res = command.execute();
      expect(res).toEqual(true);
      expect(data.barriersMap).toEqual({ [getCoordIndex2(25, 25)]: true });
      expect(data.portalsMap).toEqual({ [getCoordIndex2(25, 25)]: null });
      command.rollback();
      expect(data.barriersMap).toEqual({ [getCoordIndex2(25, 25)]: undefined });
      expect(data.portalsMap).toEqual({ [getCoordIndex2(25, 25)]: 5 });
    });
  });
  describe('SetNospawnCommand', () => {
    it('should set nospawn', () => {
      let editorData: EditorData = getTestData();
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        editorData = setter(editorData);
      };
      const command = new SetNospawnCommand(getCoordIndex2(55, 55), editorData, setData, () => { });
      const res = command.execute();
      expect(res).toEqual(true);
      expect(editorData.nospawnsMap).toEqual({ [getCoordIndex2(55, 55)]: true });
      command.rollback();
      expect(editorData.nospawnsMap).toEqual({ [getCoordIndex2(55, 55)]: undefined });
    });
    it('should ignore if elements already set', () => {
      let data: EditorData = getTestData({
        applesMap: { [getCoordIndex2(1, 1)]: true },
        barriersMap: { [getCoordIndex2(2, 2)]: true },
        doorsMap: { [getCoordIndex2(3, 3)]: true },
        keysMap: { [getCoordIndex2(4, 4)]: KeyChannel.Red },
        locksMap: { [getCoordIndex2(5, 5)]: KeyChannel.Blue },
        portalsMap: { [getCoordIndex2(6, 6)]: 6 },
      });
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const commands = [
        new SetNospawnCommand(getCoordIndex2(1, 1), data, setData, () => { }),
        new SetNospawnCommand(getCoordIndex2(2, 2), data, setData, () => { }),
        new SetNospawnCommand(getCoordIndex2(3, 3), data, setData, () => { }),
        new SetNospawnCommand(getCoordIndex2(4, 4), data, setData, () => { }),
        new SetNospawnCommand(getCoordIndex2(5, 5), data, setData, () => { }),
        new SetNospawnCommand(getCoordIndex2(6, 6), data, setData, () => { }),
      ];
      const results = commands.map(command => command.execute());
      expect(results).toEqual([false, false, false, false, false, false]);
      expect(data.applesMap).toEqual({ [getCoordIndex2(1, 1)]: true });
      expect(data.barriersMap).toEqual({ [getCoordIndex2(2, 2)]: true });
      expect(data.doorsMap).toEqual({ [getCoordIndex2(3, 3)]: true });
      expect(data.keysMap).toEqual({ [getCoordIndex2(4, 4)]: KeyChannel.Red });
      expect(data.locksMap).toEqual({ [getCoordIndex2(5, 5)]: KeyChannel.Blue });
      expect(data.portalsMap).toEqual({ [getCoordIndex2(6, 6)]: 6 });
      expect(data.nospawnsMap).toEqual({});
    });
  });
  describe('SetPassableCommand', () => {
    it('should set passable if barrier exists at location', () => {
      let data: EditorData = getTestData({
        barriersMap: { [getCoordIndex2(5, 5)]: true }
      });
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const command = new SetPassableCommand(getCoordIndex2(5, 5), data, setData, () => { });
      const res = command.execute();
      expect(res).toEqual(true);
      expect(data.barriersMap).toEqual({ [getCoordIndex2(5, 5)]: true });
      expect(data.passablesMap).toEqual({ [getCoordIndex2(5, 5)]: true });
      command.rollback();
      expect(data.barriersMap).toEqual({ [getCoordIndex2(5, 5)]: true });
      expect(data.passablesMap).toEqual({ [getCoordIndex2(5, 5)]: undefined });
    });
    it('should not passable if no barrier exists at location', () => {
      let data: EditorData = getTestData();
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const command = new SetPassableCommand(getCoordIndex2(5, 5), data, setData, () => { });
      const res = command.execute();
      expect(res).toEqual(true);
      expect(data.barriersMap).toEqual({ [getCoordIndex2(5, 5)]: true });
      expect(data.passablesMap).toEqual({ [getCoordIndex2(5, 5)]: true });
    });
    it('should set multiple cells', () => {
      let data: EditorData = getTestData({
        barriersMap: {
          [getCoordIndex2(5, 5)]: true,
          [getCoordIndex2(15, 15)]: true,
        }
      });
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const commands = [
        new SetPassableCommand(getCoordIndex2(5, 5), data, setData, () => { }),
        new SetPassableCommand(getCoordIndex2(10, 10), data, setData, () => { }),
        new SetPassableCommand(getCoordIndex2(15, 15), data, setData, () => { }),
      ];
      const results = commands.map(command => command.execute());
      expect(results).toEqual([true, true, true]);
      expect(data.barriersMap).toEqual({
        [getCoordIndex2(5, 5)]: true,
        [getCoordIndex2(10, 10)]: true,
        [getCoordIndex2(15, 15)]: true,
      });
      expect(data.passablesMap).toEqual({
        [getCoordIndex2(5, 5)]: true,
        [getCoordIndex2(10, 10)]: true,
        [getCoordIndex2(15, 15)]: true,
      });
      commands.forEach(command => command.rollback());
      expect(data.barriersMap).toEqual({
        [getCoordIndex2(5, 5)]: true,
        [getCoordIndex2(10, 10)]: undefined,
        [getCoordIndex2(15, 15)]: true,
      });
      expect(data.passablesMap).toEqual({
        [getCoordIndex2(5, 5)]: undefined,
        [getCoordIndex2(10, 10)]: undefined,
        [getCoordIndex2(15, 15)]: undefined,
      });
    });
  });
  describe('SetKeyCommand', () => {
    it('should set key at location', () => {
      let data: EditorData = getTestData();
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const command = new SetKeyCommand(getCoordIndex2(5, 5), KeyChannel.Blue, data, setData, () => { });
      const res = command.execute();
      expect(res).toEqual(true);
      expect(data.keysMap).toEqual({ [getCoordIndex2(5, 5)]: KeyChannel.Blue });
      command.rollback();
      expect(data.keysMap).toEqual({ [getCoordIndex2(5, 5)]: undefined });
    });
    it('should not set if already set with same channel', () => {
      let data: EditorData = getTestData({
        keysMap: { [getCoordIndex2(5, 5)]: KeyChannel.Red },
      });
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const command = new SetKeyCommand(getCoordIndex2(5, 5), KeyChannel.Red, data, setData, () => { });
      const res = command.execute();
      expect(res).toEqual(false);
      expect(data.keysMap).toEqual({ [getCoordIndex2(5, 5)]: KeyChannel.Red });
    });
    it('should set key at location if already set but with different channel', () => {
      let data: EditorData = getTestData({
        keysMap: { [getCoordIndex2(5, 5)]: KeyChannel.Red },
      });
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const command = new SetKeyCommand(getCoordIndex2(5, 5), KeyChannel.Blue, data, setData, () => { });
      const res = command.execute();
      expect(res).toEqual(true);
      expect(data.keysMap).toEqual({ [getCoordIndex2(5, 5)]: KeyChannel.Blue });
      command.rollback();
      expect(data.keysMap).toEqual({ [getCoordIndex2(5, 5)]: KeyChannel.Red });
    });
    it('should also set passable if barrier exists at location', () => {
      let data: EditorData = getTestData({
        barriersMap: { [getCoordIndex2(5, 5)]: true },
      });
      const setData = (setter: (prevData: EditorData) => EditorData): void => {
        data = setter(data);
      };
      const command = new SetKeyCommand(getCoordIndex2(5, 5), KeyChannel.Blue, data, setData, () => { });
      expect(data.passablesMap).toEqual({});
      const res = command.execute();
      expect(res).toEqual(true);
      expect(data.barriersMap).toEqual({ [getCoordIndex2(5, 5)]: true });
      expect(data.passablesMap).toEqual({ [getCoordIndex2(5, 5)]: true });
      expect(data.keysMap).toEqual({ [getCoordIndex2(5, 5)]: KeyChannel.Blue });
      command.rollback();
      expect(data.barriersMap).toEqual({ [getCoordIndex2(5, 5)]: true });
      expect(data.passablesMap).toEqual({ [getCoordIndex2(5, 5)]: undefined });
      expect(data.keysMap).toEqual({ [getCoordIndex2(5, 5)]: undefined });
    });
  });
});

