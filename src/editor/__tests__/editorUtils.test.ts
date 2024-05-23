import { Vector } from "p5"
import expect from "expect"

import { buildLevel } from "../../levels/levelBuilder";
import { LEVEL_01 } from "../../levels/level01";
import { LEVEL_10 } from "../../levels/level10";
import { BasicLevelData, Key, KeyChannel, Lock, PortalChannel } from "../../types"
import { getCoordIndex2 } from "../../utils";

import { decodeMapData, decodeMapLayout, encodeMapData, encodeMapLayout } from "../editorUtils"
import JSONCrush from "../JSONCrush/JSONCrush";

describe('editorUtils', () => {
  describe('encodeMapLayout', () => {
    it('should encode / decode a map layout', () => {
      const encoded = encodeMapLayout(LEVEL_01.layout);
      const decoded = decodeMapLayout(encoded);
      expect(decoded).toStrictEqual(LEVEL_01.layout);
    });
  });

  describe('encodeMapData', () => {
    it('should encode map data for initial values', () => {
      const playerSpawnPosition: Vector = new Vector(15, 15);
      const barriers: Vector[] = []
      const doors: Vector[] = []
      const apples: Vector[] = []
      const decoratives1: Vector[] = []
      const decoratives2: Vector[] = []
      const nospawns: Vector[] = []
      const keys: Key[] = []
      const locks: Lock[] = []
      const portals: Record<PortalChannel, Vector[]> = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
      }
      const levelData: BasicLevelData = {
        playerSpawnPosition,
        barriers,
        doors,
        apples,
        decoratives1,
        decoratives2,
        nospawns,
        keys,
        locks,
        portals,
      }
      const encoded = encodeMapData(levelData);
      const decoded = decodeMapData(encoded);

      expect(decoded.playerSpawnPosition).toEqual(levelData.playerSpawnPosition);
      expect(decoded.barriers).toEqual([]);
      expect(decoded.doors).toEqual([]);
      expect(decoded.apples).toEqual([]);
      expect(decoded.decoratives1).toEqual([]);
      expect(decoded.decoratives2).toEqual([]);
      expect(decoded.nospawns).toEqual([]);
      expect(decoded.keys).toEqual([]);
      expect(decoded.locks).toEqual([]);
      expect(decoded.portals[0]).toEqual([]);
      expect(decoded.portals[1]).toEqual([]);
      expect(decoded.portals[2]).toEqual([]);
      expect(decoded.portals[3]).toEqual([]);
      expect(decoded.portals[4]).toEqual([]);
      expect(decoded.portals[5]).toEqual([]);
      expect(decoded.portals[6]).toEqual([]);
      expect(decoded.portals[7]).toEqual([]);
      expect(decoded.portals[8]).toEqual([]);
      expect(decoded.portals[9]).toEqual([]);
    });

    it('should support different encoding options', () => {
      const playerSpawnPosition: Vector = new Vector(13, 13);
      const barriers: Vector[] = [
        new Vector(1, 1),
      ];
      const doors: Vector[] = [
        new Vector(2, 2),
      ];
      const apples: Vector[] = [
        new Vector(3, 3),
      ];
      const decoratives1: Vector[] = [
        new Vector(4, 4),
      ];
      const decoratives2: Vector[] = [
        new Vector(5, 5),
      ];
      const nospawns: Vector[] = [
        new Vector(6, 6),
      ];
      const keys: Key[] = [
        { position: new Vector(6, 6), channel: KeyChannel.Yellow },
      ]
      const locks: Lock[] = [
        { position: new Vector(7, 7), channel: KeyChannel.Yellow, coord: getCoordIndex2(7, 7) },
      ]
      const portals: Record<PortalChannel, Vector[]> = {
        0: [new Vector(8, 0)],
        1: [new Vector(9, 0)],
        2: [new Vector(10, 0)],
        3: [new Vector(11, 0)],
        4: [new Vector(12, 0)],
        5: [new Vector(13, 0)],
        6: [new Vector(14, 0)],
        7: [new Vector(15, 0)],
        8: [new Vector(16, 0)],
        9: [new Vector(17, 0)],
      }
      const levelData: BasicLevelData = {
        playerSpawnPosition,
        barriers,
        doors,
        apples,
        decoratives1,
        decoratives2,
        nospawns,
        keys,
        locks,
        portals,
      }
      const encoded0 = encodeMapData(levelData, true);
      const encoded1 = encodeMapData(levelData, false);

      expect(encoded0).not.toEqual(encoded1);

      const decoded0 = decodeMapData(encoded0, true);
      const decoded1 = decodeMapData(encoded1, false);

      const fields: (keyof BasicLevelData)[] = [
        'apples',
        'barriers',
        'decoratives1',
        'decoratives2',
        'doors',
        'keys',
        'locks',
        'nospawns',
        'playerSpawnPosition',
      ];
      fields.forEach(field => {
        expect(decoded0[field]).toEqual(levelData[field]);
        expect(decoded0[field]).toEqual(decoded1[field]);
      })
      const portalChannels: PortalChannel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      portalChannels.forEach(channel => {
        expect(decoded0.portals[channel]).toEqual(levelData.portals[channel]);
        expect(decoded0.portals[channel]).toEqual(decoded1.portals[channel]);
      });
    });

    it('should encode map data barriers', () => {
      const playerSpawnPosition: Vector = new Vector(13, 13);
      const barriers: Vector[] = []
      const doors: Vector[] = []
      const apples: Vector[] = []
      const decoratives1: Vector[] = []
      const decoratives2: Vector[] = []
      const nospawns: Vector[] = []
      const keys: Key[] = []
      const locks: Lock[] = []
      const portals: Record<PortalChannel, Vector[]> = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
      }
      for (let i = 0; i < 29; i++) {
        if (i === 14 || i === 15) continue;
        barriers.push(new Vector(0, i));
        barriers.push(new Vector(29, i));
        barriers.push(new Vector(i, 0));
        barriers.push(new Vector(i, 29));
      }
      const levelData: BasicLevelData = {
        playerSpawnPosition,
        barriers,
        doors,
        apples,
        decoratives1,
        decoratives2,
        nospawns,
        keys,
        locks,
        portals,
      }
      const encoded = encodeMapData(levelData);
      const decoded = decodeMapData(encoded);

      expect(decoded.playerSpawnPosition).toEqual(levelData.playerSpawnPosition);
      levelData.barriers.forEach(source => {
        const found = decoded.barriers.find(target => target.x === source.x && target.y === source.y);
        if (!found) {
          throw new Error(`unable to find match for barrier ${source.toString()}`);
        }
      });
    });

    it('should encode a real level', () => {
      const levelData = buildLevel(LEVEL_10);
      const encoded = encodeMapData(levelData);
      const decoded = decodeMapData(encoded);

      expect(decoded.playerSpawnPosition).toEqual(levelData.playerSpawnPosition);
      levelData.barriers.forEach(source => {
        const found = decoded.barriers.find(target => target.x === source.x && target.y === source.y);
        if (!found) throw new Error(`unable to find match for barrier ${source.toString()}`);
      });
      levelData.doors.forEach(source => {
        const found = decoded.doors.find(target => target.x === source.x && target.y === source.y);
        if (!found) throw new Error(`unable to find match for door ${source.toString()}`);
      });
      levelData.decoratives1.forEach(source => {
        const found = decoded.decoratives1.find(target => target.x === source.x && target.y === source.y);
        if (!found) throw new Error(`unable to find match for decorative1 ${source.toString()}`);
      })
      levelData.decoratives2.forEach(source => {
        const found = decoded.decoratives2.find(target => target.x === source.x && target.y === source.y);
        if (!found) throw new Error(`unable to find match for decorative2 ${source.toString()}`);
      })
    })
  });
});
