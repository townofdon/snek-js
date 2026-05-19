import assert from "assert";

import {
  buildPipesMap,
  getCoordIndex2,
  getManhattanDistance,
  isOppositeDirection,
  isOrthogonalDirection,
  isSameDirection,
  rotateSystemAfterPortalTraverse,
} from "../utils";
import { DIR, PipeConnection } from "../types";
import { Vector } from "p5";
import { GRIDCOUNT_X, GRIDCOUNT_Y } from "@/constants";

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
    console.log('-------------')
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      let str = '';
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        str += getPipeChar(pipesMap[getCoordIndex2(x, y)]);
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
});
