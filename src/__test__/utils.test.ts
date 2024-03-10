import assert from "assert";

import { getTraversalDistance, isOppositeDirection, isOrthogonalDirection, isSameDirection } from "../utils";
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
});
