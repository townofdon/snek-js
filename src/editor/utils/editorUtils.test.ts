import { Vector } from "p5"
import expect from "expect"

import { buildLevel } from "../../levels/levelBuilder";
import { LEVEL_01 } from "../../levels/level01";
import { LEVEL_10 } from "../../levels/level10";
import { LEVELS } from "../../levels";
import { DIR, EditorData, EditorOptions, Key, KeyChannel, Level, LevelType, Lock, MusicTrack, PortalChannel, PortalExitMode } from "../../types"
import { coordToVec, getCoordIndex2 } from "../../utils";

import { buildMapLayout, decodeMapData, decode, encodeMapData, encode, getEditorDataFromLayout, printLayout } from "./editorUtils"
import { GRIDCOUNT, OST_MODE_TRACKS } from "../../constants";
import { PALETTE } from "../../palettes";
import { EDITOR_DEFAULTS } from "../editorConstants";

const DEBUG = process.env.DEBUG;

function expectLayoutMatches(actual: string, expected: string) {
  const stripBlankLine = /^\s*\n\s*$/gm
  const stripMarginsStart = /^\s*\|(?=.)/gm
  const stripMarginsEnd = /\|\s*$/gm
  const expectedLayout = expected
    .replace(stripBlankLine, '')
    .replace(stripMarginsStart, '')
    .replace(stripMarginsEnd, '')
    .replace(/\./g, ' ')
    .replace(/O/g, ' ')
    .replace(/a/g, 'A')
    .replace(/D/g, 'd')
  const actualLayout = actual
    .replace(/a/g, 'A');
  expect(actualLayout.trim()).toEqual(expectedLayout.trim());
}

describe('editorUtils', () => {
  describe('encodeMapLayout', () => {
    it('should encode / decode a map layout', () => {
      const encoded = encode(LEVEL_01.layout);
      const decoded = decode(encoded);
      expect(decoded).toStrictEqual(LEVEL_01.layout);
    });
  });

  describe('encodeMapData', () => {
    it('should encode map data for initial values', () => {
      const options: EditorOptions = {
        name: "test",
        timeToClear: 0,
        applesToClear: 0,
        numApplesStart: 0,
        disableAppleSpawn: false,
        snakeStartSize: 0,
        growthMod: 0,
        extraHurtGraceTime: 0,
        globalLight: 0,
        palette: PALETTE.atomic,
        portalExitConfig: EDITOR_DEFAULTS.options.portalExitConfig,
        musicTrack: MusicTrack.None,
      }
      const data: EditorData = {
        barriersMap: {},
        passablesMap: {},
        doorsMap: {},
        decoratives1Map: {},
        decoratives2Map: {},
        nospawnsMap: {},
        applesMap: {},
        keysMap: {},
        locksMap: {},
        portalsMap: {},
        playerSpawnPosition: new Vector(15, 15),
        startDirection: DIR.RIGHT,
      }
      const encoded = encodeMapData(data, options);
      const [decodedData, decodedOptions] = decodeMapData(encoded);

      expect(decodedOptions).toEqual(options);
      expect(decodedData.playerSpawnPosition).toEqual(data.playerSpawnPosition);
      expect(decodedData.startDirection).toEqual(data.startDirection);
      expect(decodedData.barriersMap).toEqual({});
      expect(decodedData.doorsMap).toEqual({});
      expect(decodedData.applesMap).toEqual({});
      expect(decodedData.decoratives1Map).toEqual({});
      expect(decodedData.decoratives2Map).toEqual({});
      expect(decodedData.nospawnsMap).toEqual({});
      expect(decodedData.keysMap).toEqual({});
      expect(decodedData.locksMap).toEqual({});
      expect(decodedData.portalsMap).toEqual({});
    });

    it('should encode map data for filled values', () => {
      const options: EditorOptions = {
        name: "doomzone",
        timeToClear: 1000,
        applesToClear: 999,
        numApplesStart: 20,
        disableAppleSpawn: true,
        snakeStartSize: 50,
        growthMod: 2,
        extraHurtGraceTime: 40,
        globalLight: 0.5,
        palette: PALETTE.forest,
        portalExitConfig: {
          0: PortalExitMode.SameDirection,
          1: PortalExitMode.SameDirection,
          2: PortalExitMode.InvertDirection,
          3: PortalExitMode.InvertDirection,
          4: PortalExitMode.SameDirection,
          5: PortalExitMode.SameDirection,
          6: PortalExitMode.SameDirection,
          7: PortalExitMode.SameDirection,
          8: PortalExitMode.InvertDirection,
          9: PortalExitMode.SameDirection,
        },
        musicTrack: MusicTrack.None,
      }
      const data: EditorData = {
        barriersMap: { 1: true, 2: true, 3: true, 4: true },
        passablesMap: { 3: true, 4: true },
        doorsMap: { 5: true, 6: true },
        decoratives1Map: { 7: true, 8: true },
        decoratives2Map: { 9: true, 10: true },
        nospawnsMap: { 11: true, 12: true },
        applesMap: { 13: true, 14: true },
        keysMap: { 15: KeyChannel.Yellow, 16: KeyChannel.Red, 17: KeyChannel.Blue },
        locksMap: { 18: KeyChannel.Yellow, 19: KeyChannel.Red, 20: KeyChannel.Blue },
        portalsMap: {
          30: 0,
          31: 1,
          32: 2,
          33: 3,
          34: 4,
          35: 5,
          36: 6,
          37: 7,
          38: 8,
          39: 9,
        },
        playerSpawnPosition: new Vector(15, 15),
        startDirection: DIR.LEFT,
      }
      const encoded = encodeMapData(data, options);
      const [decodedData, decodedOptions] = decodeMapData(encoded);

      expect(decodedOptions).toEqual(options);
      expect(decodedData.playerSpawnPosition).toEqual(data.playerSpawnPosition);
      expect(decodedData.startDirection).toEqual(data.startDirection);
      expect(decodedData.barriersMap).toEqual(data.barriersMap);
      expect(decodedData.passablesMap).toEqual(data.passablesMap);
      expect(decodedData.doorsMap).toEqual(data.doorsMap);
      expect(decodedData.applesMap).toEqual(data.applesMap);
      expect(decodedData.decoratives1Map).toEqual({
        ...data.decoratives1Map,
        // doors
        5: true,
        6: true,
      });
      expect(decodedData.decoratives2Map).toEqual({
        ...data.decoratives2Map,
        // locks
        18: true,
        19: true,
        20: true,
      });
      expect(decodedData.nospawnsMap).toEqual({
        ...data.nospawnsMap,
        ...data.applesMap,
        // keys
        15: true,
        16: true,
        17: true,
        // locks
        18: true,
        19: true,
        20: true,
        // portals
        30: true,
        31: true,
        32: true,
        33: true,
        34: true,
        35: true,
        36: true,
        37: true,
        38: true,
        39: true,
      });
      expect(decodedData.keysMap).toEqual(data.keysMap);
      expect(decodedData.locksMap).toEqual(data.locksMap);
      expect(decodedData.portalsMap).toEqual(data.portalsMap);
    });

    it('should encode map data barriers', () => {
      const options: EditorOptions = {
        name: "test",
        timeToClear: 0,
        applesToClear: 0,
        numApplesStart: 0,
        disableAppleSpawn: false,
        snakeStartSize: 0,
        growthMod: 0,
        extraHurtGraceTime: 0,
        globalLight: 0,
        palette: PALETTE.atomic,
        portalExitConfig: EDITOR_DEFAULTS.options.portalExitConfig,
        musicTrack: MusicTrack.None,
      }
      const data: EditorData = {
        barriersMap: {},
        passablesMap: {},
        doorsMap: {},
        decoratives1Map: {},
        decoratives2Map: {},
        nospawnsMap: {},
        applesMap: {},
        keysMap: {},
        locksMap: {},
        portalsMap: {},
        playerSpawnPosition: new Vector(13, 13),
        startDirection: DIR.DOWN,
      }
      for (let i = 0; i < 29; i++) {
        if (i === 14 || i === 15) continue;
        data.barriersMap[getCoordIndex2(0, i)] = true;
        data.barriersMap[getCoordIndex2(29, i)] = true;
        data.barriersMap[getCoordIndex2(i, 0)] = true;
        data.barriersMap[getCoordIndex2(i, 29)] = true;
      }
      data.barriersMap[getCoordIndex2(29, 29)] = true;
      const encoded = encodeMapData(data, options);
      const [decodedData, decodedOptions] = decodeMapData(encoded);

      expect(decodedOptions).toEqual(options);
      expect(decodedData.playerSpawnPosition).toEqual(data.playerSpawnPosition);
      Object.entries(data.barriersMap).forEach(([coord, visible]) => {
        const found = decodedData.barriersMap[Number(coord)]
        if (visible && !found) throw new Error(`unable to find match for barrier ${coordToVec(Number(coord)).toString()}`);
      });
    });

    it('should encode and decode music tracks', () => {
      const test = (track: MusicTrack) => {
        const data: EditorData = { ...EDITOR_DEFAULTS.data };
        const options: EditorOptions = { ...EDITOR_DEFAULTS.options, musicTrack: track };
        const encoded = encodeMapData(data, options);
        const [_, decodedOptions] = decodeMapData(encoded);
        expect(decodedOptions.musicTrack).toEqual(track);
      }
      test(MusicTrack.None);
      OST_MODE_TRACKS.forEach(track => test(track));
    });

    it('should decode old data lacking music track', () => {
      const test = (encoded: string) => {
        const [_, decodedOptions] = decodeMapData(encoded);
        expect(decodedOptions.musicTrack).toEqual(MusicTrack.None);
      }
      test('b2Iod2RXWDZYKE1NVjNjIDRYZFgoTClfaVdYQVgoJ2NkWWMhJ0tkKCdZKSduaHVuIVVZTWVkbGcuIWdkKmVYLlVndDBYZTAuVW4gSjJYWmJnVVl0WnMuVW4hWmkqLnBndmRWN1guczYhbil1ZFVjcmlMdmRVKVloZWdwc2RNZGVnKSdkZ3JkWllNJ2pkTWRaWWRiaF9ac1Y3TWNaKlZYKWIpX2VYM1hNVjFjdlkpYlZYd3VkTTFYTWNuKF9kYmhoWXFjJyhYNHB3X2JxTWsgNFgybyoKfDYwOXxSSUdIVHxTTkVLQk9TU3wzMDAwMDBRM1EzUTEwMFEjMTVDMkNCUDExOURBNGYyMzc1OFAyRTRBNzZtZjcyQzNGbVA0QzgyQTlQM0Y2QzhEUEZGRjZGMVAwQTBFMTRQRTlFRkZGfGFhYTAhICAnIGQoWApYX3IqYlhVJ2MhIVAtI1F8MXxVLidWIFhXKioqKllkJ1oudV8pcmEwLTAtMC1iWFhjTXZVKGZQMTYxOTI1UDJnZC53KWlkIG1QMUYyMzMzbiFZbwpXVypwISEncShiKU1NcmRkc2QhdCAqdS4odiFld2gpAXd2dXRzcnFwb25taWhnZmVjYmFfWllXVlVRUE0uKikoJyFf');
      test('Y1hwcHBXWG1XLSEtcHBXKFYtIVotIS15cFcoVlpWVi0uTHAtXyhmLW4gfl8oZi1uLX4hLm1KZSctbi0teW5vZlhkWFotZW5vdGRBWGdkJ290TEFMWGdBTFgtIWpqaiEoZS5RKWdMQVgtby5RV2dkWFonV1gKRHl5KiBiVmJuIS1XYVh4WCchRG15a2VRKXByTFgnIShKJ2VRTEFkXylLS1hMdkpRSipkQUwhLkxBTGFYeHYpVik9IVhBZGFYQXYpJ1dhIVhkWGFYQXopJ1pWVkwgVnJBeillWmYnTCBmWHh2aSpsckx6aW5YTHopWFF3Slh4emYqZHhBQUFBQUF4ZG5ZZVguJ3duWWohLmZmbkpmZlhjfDQwMnxSSUdIVHxNRUdBU05FS09QT0xJU3w2czY3fDN8czN8MXxzMXwjREJBRTk1VUMyN0E1MHFBNUE2QTdVODdBMkMwdXEyNzJDM0Z1VUNCQ0RDRFVEMkQ0RDRVNzI5RkMwVTQ2Nzc5QlU0QzgyQTl8aGhoMF90PShYbSApZWUqJz0uIFhRWD1VLSNWJyBXISFZeHg9KFotIF8hIGEgPWJWLS0tV2ZXRApELlFlWGMKd1hERER3ZQpkTExlWFhmJydnLS0tZFhoMC0wLTAtaUR4QUF4RCApKW0KWG4nKm9XXyhlcFdXcVUxNjE5MjVVcj1YczB8dCAqdVUxRjIzMzN2WGYodykpKXkuWHpRWX5aZFYnVwF%2Benl3dnV0c3JxcG9ubWloZ2ZlZGNiYV9aWVdWVVEuKikoJyFf');
    });

    it('should encode a real level', () => {
      const options: EditorOptions = {
        name: "test",
        timeToClear: 0,
        applesToClear: 0,
        numApplesStart: 0,
        disableAppleSpawn: false,
        snakeStartSize: 0,
        growthMod: 0,
        extraHurtGraceTime: 0,
        globalLight: 0,
        palette: PALETTE.atomic,
        portalExitConfig: EDITOR_DEFAULTS.options.portalExitConfig,
        musicTrack: MusicTrack.None,
      }
      const data = getEditorDataFromLayout(LEVEL_10.layout, new Vector(0, 0), DIR.UP);
      const encoded = encodeMapData(data, options);
      const [decodedData, decodedOptions] = decodeMapData(encoded);

      expect(decodedData.playerSpawnPosition).toEqual(data.playerSpawnPosition);
      expect(decodedOptions).toEqual(options);
      Object.entries(data.barriersMap).forEach(([coord, visible]) => {
        const found = !!decodedData.barriersMap[Number(coord)]
        if (visible && !found) throw new Error(`unable to find match for barrier ${coordToVec(Number(coord)).toString()}`);
      });
      Object.entries(data.doorsMap).forEach(([coord, visible]) => {
        const found = !!decodedData.doorsMap[Number(coord)]
        if (visible && !found) throw new Error(`unable to find match for door ${coordToVec(Number(coord)).toString()}`);
      });
      Object.entries(data.decoratives1Map).forEach(([coord, visible]) => {
        const found = !!decodedData.decoratives1Map[Number(coord)]
        if (visible && !found) throw new Error(`unable to find match for decorative1 ${coordToVec(Number(coord)).toString()}`);
      });
      Object.entries(data.decoratives2Map).forEach(([coord, visible]) => {
        const found = !!decodedData.decoratives2Map[Number(coord)]
        if (visible && !found) throw new Error(`unable to find match for decorative2 ${coordToVec(Number(coord)).toString()}`);
      });
    })
  });

  describe('buildMapLayout', () => {
    it('should build a map layout correctly for all possible types', () => {
      const data: EditorData = {
        applesMap: { 0: true },
        barriersMap: { 1: true, 2: true, 100: true, 101: true, 102: true },
        passablesMap: { 2: true },
        doorsMap: { 3: true },
        decoratives1Map: { 4: true, 7: true },
        decoratives2Map: { 5: true, 8: true },
        nospawnsMap: { 6: true, 7: true, 8: true },
        portalsMap: {
          50: 0,
          51: 1,
          52: 2,
          53: 3,
          54: 4,
          55: 5,
          56: 6,
          57: 7,
          58: 8,
          59: 9,
        },
        keysMap: {
          20: KeyChannel.Yellow,
          21: KeyChannel.Red,
          22: KeyChannel.Blue,
          100: KeyChannel.Yellow,
          101: KeyChannel.Red,
          102: KeyChannel.Blue,
        },
        locksMap: {
          30: KeyChannel.Yellow,
          31: KeyChannel.Red,
          32: KeyChannel.Blue,
        },
        playerSpawnPosition: new Vector(0, 0),
        startDirection: DIR.RIGHT,
      }
      const layout = buildMapLayout(data);
      const expected = `
      |AXxD-=~_+...........jkl.......|
      |JKL.................0123456789|
      |..............................|
      |..........uio.................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      |..............................|
      `
      expectLayoutMatches(layout, expected);
    })

    it('should build a map layout correctly for all game levels', () => {
      const testLevel = (level: Level, index: number) => {
        try {
          const levelData = buildLevel(level);
          const expectedLayout = level.layout;
          const data: EditorData = {
            applesMap: {},
            barriersMap: { ...levelData.barriersMap },
            passablesMap: { ...levelData.passablesMap },
            doorsMap: { ...levelData.doorsMap },
            decoratives1Map: { ...levelData.decoratives1Map },
            decoratives2Map: { ...levelData.decoratives2Map },
            nospawnsMap: { ...levelData.nospawnsMap },
            portalsMap: {},
            keysMap: {},
            locksMap: {},
            playerSpawnPosition: new Vector(0, 0),
            startDirection: DIR.RIGHT,
          };
          for (let y = 0; y < GRIDCOUNT.y; y++) {
            for (let x = 0; x < GRIDCOUNT.x; x++) {
              const coord = getCoordIndex2(x, y);
              if (levelData.portalsMap[coord]) {
                data.portalsMap[coord] = levelData.portalsMap[coord].channel;
              }
              if (levelData.keysMap[coord]) {
                data.keysMap[coord] = levelData.keysMap[coord].channel;
              }
              if (levelData.locksMap[coord]) {
                data.locksMap[coord] = levelData.locksMap[coord].channel;
              }
            }
          }
          levelData.apples.forEach(apple => {
            const coord = getCoordIndex2(apple.x, apple.y);
            data.applesMap[coord] = true;
          })
          const layout = buildMapLayout(data);
          expectLayoutMatches(layout, expectedLayout);

          if (DEBUG) {
            console.log("layout:")
            printLayout(layout);
            console.log("expected:")
            printLayout(expectedLayout);
          }

          console.log(`      ✔ layouts matched for ${String(index).padStart(2, '0')} ${level.name}`)
        } catch (err) {
          console.log(`      x layout failed for level ${level.name}`);
          throw err;
        }
      };
      LEVELS
        .filter(level => level !== LEVEL_01 && level.type !== LevelType.Maze && level.type !== LevelType.WarpZone)
        .forEach(testLevel)
    });
  });
});
