import assert from "assert";

import {
  getTraversalDistance,
  isOppositeDirection,
  isOrthogonalDirection,
  isSameDirection,
  rotateSystemAfterPortalTraverse,
} from "../utils";
import { DIR } from "../types";

describe("Utils", () => {
  describe("getTraversalDistance", () => {
    it("should calc correct value", () => {
      assert(getTraversalDistance(5, 5, 5, 5) === 0);
      assert(getTraversalDistance(0, 0, 0, 1) === 1);
      assert(getTraversalDistance(0, 0, 1, 1) === 2);
      assert(getTraversalDistance(0, 0, 29, 29) === 58);
      assert(getTraversalDistance(29, 29, 0, 0) === 58);
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
  })
});
