import assert from "assert";

import {
  buildPipesMap,
  findPipeExit,
  getCoordIndex2,
  getCoordX,
  getCoordY,
  getManhattanDistance,
  isOppositeDirection,
  isOrthogonalDirection,
  isSameDirection,
  rotateSystemAfterPortalTraverse,
  validPipeExit,
} from "../utils";
import { DIR, Level, PipeConnection } from "../types";
import { Vector } from "p5";
import { GRIDCOUNT_X, GRIDCOUNT_Y } from "@/constants";
import { DEFAULT_ENGINE_STATE, DEFAULT_GAME_STATE } from "@/defaults";
import { buildLevel } from "@/levels/levelBuilder";
import { buildMapLayout, decodeMapData } from "@/editor/utils/editorUtils";

const DEBUG = process.env.DEBUG;

describe("Utils", () => {
  describe("getManhattanDistance", () => {
    it("should calc correct value", () => {
      assert(getManhattanDistance(5, 5, 5, 5) === 0);
      assert(getManhattanDistance(0, 0, 0, 1) === 1);
      assert(getManhattanDistance(0, 0, 1, 1) === 2);
      assert(getManhattanDistance(0, 0, 29, 29) === 58);
      assert(getManhattanDistance(29, 29, 0, 0) === 58);
    });
  });

  describe("isSameDirection", () => {
    it("should calc correct value", () => {
      assert(isSameDirection(DIR.UP, DIR.DOWN) === false);
      assert(isSameDirection(DIR.UP, DIR.LEFT) === false);
      assert(isSameDirection(DIR.UP, DIR.RIGHT) === false);
      assert(isSameDirection(DIR.UP, DIR.UP) === true);
      assert(isSameDirection(DIR.DOWN, DIR.DOWN) === true);
      assert(isSameDirection(DIR.LEFT, DIR.LEFT) === true);
      assert(isSameDirection(DIR.RIGHT, DIR.RIGHT) === true);
    })
  });

  describe("isOppositeDirection", () => {
    it("should calc correct value", () => {
      assert(isOppositeDirection(DIR.UP, DIR.UP) === false);
      assert(isOppositeDirection(DIR.UP, DIR.LEFT) === false);
      assert(isOppositeDirection(DIR.UP, DIR.RIGHT) === false);
      assert(isOppositeDirection(DIR.UP, DIR.DOWN) === true);
      assert(isOppositeDirection(DIR.DOWN, DIR.UP) === true);
      assert(isOppositeDirection(DIR.LEFT, DIR.RIGHT) === true);
      assert(isOppositeDirection(DIR.RIGHT, DIR.LEFT) === true);
    })
  });

  describe("isOrthogonalDirection", () => {
    it("should calc correct value", () => {
      assert(isOrthogonalDirection(DIR.UP, DIR.DOWN) === false);
      assert(isOrthogonalDirection(DIR.LEFT, DIR.RIGHT) === false);
      assert(isOrthogonalDirection(DIR.DOWN, DIR.UP) === false);
      assert(isOrthogonalDirection(DIR.RIGHT, DIR.LEFT) === false);
      assert(isOrthogonalDirection(DIR.UP, DIR.LEFT) === true);
      assert(isOrthogonalDirection(DIR.UP, DIR.RIGHT) === true);
      assert(isOrthogonalDirection(DIR.LEFT, DIR.UP) === true);
      assert(isOrthogonalDirection(DIR.LEFT, DIR.DOWN) === true);
      assert(isOrthogonalDirection(DIR.DOWN, DIR.LEFT) === true);
      assert(isOrthogonalDirection(DIR.DOWN, DIR.RIGHT) === true);
      assert(isOrthogonalDirection(DIR.RIGHT, DIR.UP) === true);
      assert(isOrthogonalDirection(DIR.RIGHT, DIR.DOWN) === true);
    })
  });

  describe("rotateSystemAfterPortalTraverse", () => {
    const test = (prev: DIR, current: DIR, expectations: [DIR, DIR][]) => {
      expectations.forEach(([arg, expected], idx) => {
        const result = rotateSystemAfterPortalTraverse(prev, current, arg);
        assert.strictEqual(result, expected, `expected:${expected},got:${result},idx=${idx},fn(${prev},${current},${arg})`);
      })
    }
    it("should not rotate if no change", () => {
      const expectations = [
        [DIR.UP, DIR.UP],
        [DIR.RIGHT, DIR.RIGHT],
        [DIR.DOWN, DIR.DOWN],
        [DIR.LEFT, DIR.LEFT],
      ] satisfies [DIR, DIR][];
      test(DIR.UP, DIR.UP, expectations);
      test(DIR.DOWN, DIR.DOWN, expectations);
      test(DIR.LEFT, DIR.LEFT, expectations);
      test(DIR.RIGHT, DIR.RIGHT, expectations);
    });
    it("should rotate systems clockwise 90 degrees", () => {
      const expectations = [
        [DIR.UP, DIR.RIGHT],
        [DIR.RIGHT, DIR.DOWN],
        [DIR.DOWN, DIR.LEFT],
        [DIR.LEFT, DIR.UP],
      ] satisfies [DIR, DIR][];
      test(DIR.UP, DIR.RIGHT, expectations);
      test(DIR.RIGHT, DIR.DOWN, expectations);
      test(DIR.DOWN, DIR.LEFT, expectations);
      test(DIR.LEFT, DIR.UP, expectations);
    });
    it("should rotate systems clockwise 180 degrees", () => {
      const expectations = [
        [DIR.UP, DIR.DOWN],
        [DIR.RIGHT, DIR.LEFT],
        [DIR.DOWN, DIR.UP],
        [DIR.LEFT, DIR.RIGHT],
      ] satisfies [DIR, DIR][];
      test(DIR.UP, DIR.DOWN, expectations);
      test(DIR.RIGHT, DIR.LEFT, expectations);
      test(DIR.DOWN, DIR.UP, expectations);
      test(DIR.LEFT, DIR.RIGHT, expectations);
    });
    it("should rotate systems clockwise 270 degrees", () => {
      const expectations = [
        [DIR.UP, DIR.LEFT],
        [DIR.RIGHT, DIR.UP],
        [DIR.DOWN, DIR.RIGHT],
        [DIR.LEFT, DIR.DOWN],
      ] satisfies [DIR, DIR][];
      test(DIR.UP, DIR.LEFT, expectations);
      test(DIR.RIGHT, DIR.UP, expectations);
      test(DIR.DOWN, DIR.RIGHT, expectations);
      test(DIR.LEFT, DIR.DOWN, expectations);
    });
  });

  const getPipeChar = (connection: PipeConnection) => {
    switch (connection) {
      case PipeConnection.N:
        return'╵';
      case PipeConnection.S:
        return'╷';
      case PipeConnection.NS:
        return'│';
      case PipeConnection.W:
        return '╴';
      case PipeConnection.NW:
        return'┘';
      case PipeConnection.SW:
        return'┐';
      case PipeConnection.NSW:
        return'┤';
      case PipeConnection.E:
        return'╶';
      case PipeConnection.NE:
        return'└';
      case PipeConnection.SE:
        return'┌';
      case PipeConnection.NSE:
        return'├';
      case PipeConnection.WE:
        return'─';
      case PipeConnection.NWE:
        return'┴';
      case PipeConnection.SWE:
        return'┬';
      case PipeConnection.NSWE:
        return'┼';
      case PipeConnection.Island:
        return'*';
      case PipeConnection.Unset:
      default:
        return'.';
    }
  }

  const debugPipesMap = (pipesMap: Record<number, PipeConnection>) => {
    const ANSI_RESET = "\x1b[0m";
    const ANSI_RED = "\x1b[31m";
    const ANSI_YELLOW = "\x1b[33m";
    console.log('-------------');
    const exits = [];
    const engineState = { ...DEFAULT_ENGINE_STATE, pipesMap };
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      let str = '';
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const connection = pipesMap[getCoordIndex2(x, y)];
        const char = getPipeChar(pipesMap[getCoordIndex2(x, y)]);
        const exit = validPipeExit(getCoordIndex2(x, y), DEFAULT_GAME_STATE, engineState);
        if (exit) {
          str += ANSI_RED + char + ANSI_RESET;
          exits.push(getCoordIndex2(x, y));
        } else if (connection) {
          str += ANSI_YELLOW + char + ANSI_RESET;
        } else {
          str += char;
        }
      }
      console.log(str);
    }
  }

  describe("buildPipesMap", () => {
    it('should build islands correctly', () => {
      const pipes: Vector[] = [
        new Vector(3, 3),
        new Vector(4, 4),
        new Vector(5, 5),
        new Vector(3, 6),
        new Vector(4, 7),
        new Vector(5, 8),
      ];
      const pipesMap: Record<number, PipeConnection> = {};
      buildPipesMap(pipes, pipesMap);
      assert.strictEqual(pipesMap[getCoordIndex2(3, 3)], PipeConnection.Island);
      assert.strictEqual(pipesMap[getCoordIndex2(4, 4)], PipeConnection.Island);
      assert.strictEqual(pipesMap[getCoordIndex2(5, 5)], PipeConnection.Island);
      assert.strictEqual(pipesMap[getCoordIndex2(3, 6)], PipeConnection.Island);
      assert.strictEqual(pipesMap[getCoordIndex2(4, 7)], PipeConnection.Island);
      assert.strictEqual(pipesMap[getCoordIndex2(5, 8)], PipeConnection.Island);
      if (DEBUG) {
        debugPipesMap(pipesMap);
      }
    });
    it('should build simple pipes map', () => {
      const pipes: Vector[] = [
        new Vector(15, 15),
        new Vector(14, 15),
        new Vector(14, 14),
        new Vector(13, 14),
        new Vector(15, 14),
        new Vector(15, 13),
        new Vector(16, 15),
        new Vector(17, 15),
        new Vector(17, 14),
        new Vector(18, 14),
        new Vector(17, 16),
        new Vector(18, 16),
      ];
      const pipesMap: Record<number, PipeConnection> = {};
      buildPipesMap(pipes, pipesMap);
      if (DEBUG) {
        debugPipesMap(pipesMap);
      }
    });
    it('should build complex pipes map', () => {
      const pipes: Vector[] = [
        new Vector(15, 15),
        new Vector(14, 15),
        new Vector(14, 14),
        new Vector(13, 14),
        new Vector(15, 14),
        new Vector(15, 13),
        new Vector(16, 15),
        new Vector(17, 15),
        new Vector(17, 14),
        new Vector(18, 14),
        new Vector(17, 16),
        new Vector(18, 16),
        new Vector(19, 13),
        new Vector(19, 14),
        new Vector(19, 15),
        new Vector(19, 16),
        new Vector(19, 17),
        new Vector(19, 18),
        new Vector(19, 19),
        new Vector(19, 20),
        new Vector(20, 20),
        new Vector(20, 21),
        // ---
        new Vector(10, 3),
        new Vector(9, 3),
        new Vector(8, 3),
        new Vector(8, 4),
        new Vector(8, 5),
        new Vector(9, 5),
        new Vector(10, 5),
        new Vector(11, 5),
        new Vector(12, 5),
        new Vector(13, 5),
        new Vector(14, 5),
        new Vector(15, 5),
        new Vector(16, 5),
        new Vector(17, 5),
        new Vector(18, 5),
        new Vector(19, 5),
        new Vector(20, 5),
        new Vector(20, 4),
        new Vector(20, 3),
        new Vector(19, 3),
        new Vector(18, 3),
        // ---
        new Vector(3, 27),
        new Vector(4, 27),
        new Vector(4, 28),
        new Vector(3, 28),
      ];
      const pipesMap: Record<number, PipeConnection> = {};
      buildPipesMap(pipes, pipesMap);
      if (DEBUG) {
        debugPipesMap(pipesMap);
      }
    });
  });
  describe("validPipeExit", () => {
    it("should correctly identify pipe exits", () => {
      const pipes: Vector[] = [
        new Vector(15, 15),
        new Vector(14, 15),
        new Vector(14, 14),
        new Vector(13, 14),
        new Vector(15, 14),
        new Vector(15, 13),
        new Vector(16, 15),
        new Vector(17, 15),
        new Vector(17, 14),
        new Vector(18, 14),
        new Vector(17, 16),
        new Vector(18, 16),
        new Vector(19, 13),
        new Vector(19, 14),
        new Vector(19, 15),
        new Vector(19, 16),
        new Vector(19, 17),
        new Vector(19, 18),
        new Vector(19, 19),
        new Vector(19, 20),
        new Vector(20, 20),
        new Vector(20, 21),
        // ---
        new Vector(10, 3),
        new Vector(9, 3),
        new Vector(8, 3),
        new Vector(8, 4),
        new Vector(8, 5),
        new Vector(9, 5),
        new Vector(10, 5),
        new Vector(11, 5),
        new Vector(12, 5),
        new Vector(13, 5),
        new Vector(14, 5),
        new Vector(15, 5),
        new Vector(16, 5),
        new Vector(17, 5),
        new Vector(18, 5),
        new Vector(19, 5),
        new Vector(20, 5),
        new Vector(20, 4),
        new Vector(20, 3),
        new Vector(19, 3),
        new Vector(18, 3),
        // ---
        new Vector(3, 27),
        new Vector(4, 27),
        new Vector(4, 28),
        new Vector(3, 28),
      ];
      const pipesMap: Record<number, PipeConnection> = {};
      buildPipesMap(pipes, pipesMap);
      if (DEBUG) {
        debugPipesMap(pipesMap);
      }
      const engineState = { ...DEFAULT_ENGINE_STATE, pipesMap };
      // assert known valid exits
      assert(validPipeExit(getCoordIndex2(10, 3), DEFAULT_GAME_STATE, engineState));
      assert(validPipeExit(getCoordIndex2(18, 3), DEFAULT_GAME_STATE, engineState));
      assert(validPipeExit(getCoordIndex2(15, 13), DEFAULT_GAME_STATE, engineState));
      assert(validPipeExit(getCoordIndex2(19, 13), DEFAULT_GAME_STATE, engineState));
      assert(validPipeExit(getCoordIndex2(13, 14), DEFAULT_GAME_STATE, engineState));
      assert(validPipeExit(getCoordIndex2(20, 21), DEFAULT_GAME_STATE, engineState));
      // assert known invalid exits
      assert(!validPipeExit(getCoordIndex2(21, 21), DEFAULT_GAME_STATE, engineState));
      assert(!validPipeExit(getCoordIndex2(13, 13), DEFAULT_GAME_STATE, engineState));
      assert(!validPipeExit(getCoordIndex2(13, 15), DEFAULT_GAME_STATE, engineState));
      assert(!validPipeExit(getCoordIndex2(14, 14), DEFAULT_GAME_STATE, engineState));
      assert(!validPipeExit(getCoordIndex2(12, 14), DEFAULT_GAME_STATE, engineState));
      assert(!validPipeExit(getCoordIndex2(15, 12), DEFAULT_GAME_STATE, engineState));
      assert(!validPipeExit(getCoordIndex2(15, 14), DEFAULT_GAME_STATE, engineState));
    });
  });
  describe('findPipeExit', () => {
    type PipeTest = { given: [number, number, DIR], expected: [number, number, DIR] };
    const runTests = (pipesMap: Record<number, PipeConnection>, tests: PipeTest[]) => {
      const engineState = { ...DEFAULT_ENGINE_STATE, pipesMap };
      const errors: string[] = [];
      tests.forEach(({ given, expected }, i) => {
        try {
          const result = findPipeExit(getCoordIndex2(given[0], given[1]), given[2], DEFAULT_GAME_STATE, engineState);
          assert(result, 'no exit found');
          const [coord, exitDir] = result || [];
          assert.strictEqual(coord, getCoordIndex2(expected[0], expected[1]));
          assert.strictEqual(exitDir, expected[2]);
        } catch (error) {
          const ANSI_RESET = "\x1b[0m";
          const ANSI_RED = "\x1b[31m";
          errors.push(ANSI_RED + `test case ${i} failed.\n  given: entry=(${given[0]},${given[1]}),dir=${given[2]};\n  expected: exit=(${expected[0]},${expected[1]}),dir=${expected[2]}` + '\n  ' + String(error) + ANSI_RESET);
        }
      });
      if (errors.length) {
        throw new Error('\n' + errors.join('\n'));
      }
    }
    it('should find the exit for simple scene', () => {
      const pipes: Vector[] = [];
      for (let x = 15; x <= 19; x++) {
        pipes.push(new Vector(x, 17));
      }
      for (let y = 15; y <= 19; y++) {
        pipes.push(new Vector(17, y));
      }
      const pipesMap: Record<number, PipeConnection> = {};
      buildPipesMap(pipes, pipesMap);
      if (DEBUG) {
        debugPipesMap(pipesMap);
      }
      runTests(pipesMap, [
        { given: [15, 17, DIR.RIGHT], expected: [20, 17, DIR.RIGHT] },
        { given: [19, 17, DIR.LEFT], expected: [14, 17, DIR.LEFT] },
        { given: [17, 15, DIR.DOWN], expected: [17, 20, DIR.DOWN] },
        { given: [17, 19, DIR.UP], expected: [17, 14, DIR.UP] },
      ]);
    });
    it('should find exits for complex scene', () => {
      const levelData = buildLevel(pipeTestLevel);
      const pipesMap: Record<number, PipeConnection> = {};
      buildPipesMap(levelData.pipes, pipesMap);
      if (DEBUG) {
        debugPipesMap(pipesMap);
      }
      runTests(pipesMap, [
        { given: [1, 1, DIR.LEFT], expected: [10, 27, DIR.UP] },
        { given: [10, 28, DIR.DOWN], expected: [2, 1, DIR.RIGHT] },
        { given: [3, 4, DIR.RIGHT], expected: [11, 4, DIR.RIGHT] },
        { given: [10, 4, DIR.LEFT], expected: [2, 4, DIR.LEFT] },
        { given: [6, 2, DIR.DOWN], expected: [6, 8, DIR.DOWN] },
        { given: [6, 7, DIR.UP], expected: [6, 1, DIR.UP] },
        { given: [22, 26, DIR.UP], expected: [20, 23, DIR.LEFT] },
        { given: [15, 10, DIR.UP], expected: [15, 9, DIR.UP] },
        { given: [15, 10, DIR.DOWN], expected: [15, 11, DIR.DOWN] },
      ]);
    });
  });
});

// DO NOT MODIFY THIS DATA - just create a different level test case!
// http://localhost:3000/snek-js/editor/?data=CkxMaClqdktaUHIuIVdXJ1AoSihQIWtLUyFtKHIuSydvJy52TlprTlprUE4oTiBRWGpKTlpRdU5QIVl1J1chbVlkSidXUCEhUHIoKFltb19TX0tXSiEhV1dQa2pTKE5zUyhQWi4nKG1aLlMhSiFQb3NaSm8hLlooS3NOV0tzWihOKVMob1MuV1dKWGhRfDc4NHxSSUdIVHxVbnRpdGxlZCBNYXBjMjAwMGYyZjNPM2NPMXwjREJBRTk1KkMyN0E1MGJBNUE2QTcqODdBMkMwZ2IyNzJDM0ZnKkNCQ0RDRCpEMkQ0RDQqNzI5RkMwKjQ2Nzc5Qio0QzgyQTl8VlZWMU8xY08wTzRxIFNLIFApUVAqLSMucSltUEshIShMWFhYWFhYTicnT3xmUVgKUychVjEtMS0xLVdKSlkhZApaTiFfKCdQJ3JRWFBiKjE2MTkyNSpjfDFmMHxnKjFGMjMzM2hYZGRkTExYalBOTi5rISltSlBvS1BxISByKCFzJyl1ZEpTUHZLTlNrAXZ1c3Jxb21ramhnZmNiX1pZV1ZTUU9OTEtKLiopKCchXw%25253D%25253D
const layoutV2 = `CkxMaClqdktaUHIuIVdXJ1AoSihQIWtLUyFtKHIuSydvJy52TlprTlprUE4oTiBRWGpKTlpRdU5QIVl1J1chbVlkSidXUCEhUHIoKFltb19TX0tXSiEhV1dQa2pTKE5zUyhQWi4nKG1aLlMhSiFQb3NaSm8hLlooS3NOV0tzWihOKVMob1MuV1dKWGhRfDc4NHxSSUdIVHxVbnRpdGxlZCBNYXBjMjAwMGYyZjNPM2NPMXwjREJBRTk1KkMyN0E1MGJBNUE2QTcqODdBMkMwZ2IyNzJDM0ZnKkNCQ0RDRCpEMkQ0RDQqNzI5RkMwKjQ2Nzc5Qio0QzgyQTl8VlZWMU8xY08wTzRxIFNLIFApUVAqLSMucSltUEshIShMWFhYWFhYTicnT3xmUVgKUychVjEtMS0xLVdKSlkhZApaTiFfKCdQJ3JRWFBiKjE2MTkyNSpjfDFmMHxnKjFGMjMzM2hYZGRkTExYalBOTi5rISltSlBvS1BxISByKCFzJyl1ZEpTUHZLTlNrAXZ1c3Jxb21ramhnZmNiX1pZV1ZTUU9OTEtKLiopKCchXw%253D%253D`;
const [data] = decodeMapData(layoutV2);
const pipeTestLevel: Level = {
  id: "-pipes-test-",
  name: "pipes-test",
  timeToClear: 0,
  applesToClear: 0,
  layout: buildMapLayout(data),
  colors: undefined,
} satisfies Level;
