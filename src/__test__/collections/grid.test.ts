import assert from "assert";

import { ASTAR_GRID_SIZE } from "../../collections/astar";
import { Grid } from "../../collections/grid";
import { lerp } from "../../utils";

 function assertApproxEquals(actual: number, expected: number, tolerance = 0.01) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(`Assertion Failed, values did not match!\nactual=${actual},expected=${expected},tolerance=${tolerance}`);
  }
}

describe("Collections", () => {
  describe("Grid", () => {
    it("should get and set coord", () => {
      const grid = new Grid(ASTAR_GRID_SIZE);
      for (let i = 0; i < ASTAR_GRID_SIZE; i++) {
        const val = ASTAR_GRID_SIZE - 1 - i;
        grid.setCoord(i, val);
        assert.strictEqual(grid.getCoord(i), val, `grid coord did not match at idx=${i}: actual=${grid.getCoord(i)},expected=${val}`);
      }
    });

    it("should get and set flags", () => {
      const grid = new Grid(ASTAR_GRID_SIZE);
      for (let i = 0; i < ASTAR_GRID_SIZE; i++) {
        const val = i % 20;
        grid.setFlags(i, val);
        assert.strictEqual(grid.getFlags(i), val, `grid flags did not match at idx=${i}: actual=${grid.getFlags(i)},expected=${val}`);
      }
    });

    it("should get and set gscore", () => {
      const grid = new Grid(ASTAR_GRID_SIZE);
      for (let i = 0; i < ASTAR_GRID_SIZE; i++) {
        const val = lerp(0, 100, i / 899);
        grid.setGScore(i, val);
        assertApproxEquals(grid.getGScore(i), val, 0.1);
      }
    });

    it("should get and set hscore", () => {
      const grid = new Grid(ASTAR_GRID_SIZE);
      for (let i = 0; i < ASTAR_GRID_SIZE; i++) {
        const val = lerp(0, 100, i / 899);
        grid.setHScore(i, val);
        assertApproxEquals(grid.getHScore(i), val, 0.1);
      }
    });

    it("should get and set parent", () => {
      const grid = new Grid(ASTAR_GRID_SIZE);
      for (let i = 0; i < ASTAR_GRID_SIZE; i++) {
        const val = i + 50 % ASTAR_GRID_SIZE;
        grid.setParent(i, val);
        assert.strictEqual(grid.getParent(i), val, `grid parent did not match at idx=${i}: actual=${grid.getParent(i)},expected=${val}`);
      }
    });

    it("should get and set flags correctly", () => {
      const grid = new Grid(ASTAR_GRID_SIZE);
      for (let i = 0; i < ASTAR_GRID_SIZE; i++) {
        const msg = `idx=${i}`;
        assert.strictEqual(grid.getFlagWall(i), false, msg);
        assert.strictEqual(grid.getFlagClosed(i), false, msg);
        assert.strictEqual(grid.getFlagVisited(i), false, msg);
        grid.setFlagWall(i, true);
        assert.strictEqual(grid.getFlagWall(i), true, msg);
        assert.strictEqual(grid.getFlagClosed(i), false, msg);
        assert.strictEqual(grid.getFlagVisited(i), false, msg);
        grid.setFlagVisited(i, true);
        assert.strictEqual(grid.getFlagWall(i), true, msg);
        assert.strictEqual(grid.getFlagClosed(i), false, msg);
        assert.strictEqual(grid.getFlagVisited(i), true, msg);
        grid.setFlagWall(i, false);
        assert.strictEqual(grid.getFlagWall(i), false, msg);
        assert.strictEqual(grid.getFlagClosed(i), false, msg);
        assert.strictEqual(grid.getFlagVisited(i), true, msg);
        grid.setFlagClosed(i, true);
        assert.strictEqual(grid.getFlagWall(i), false, msg);
        assert.strictEqual(grid.getFlagClosed(i), true, msg);
        assert.strictEqual(grid.getFlagVisited(i), true, msg);
        grid.setFlagWall(i, true);
        assert.strictEqual(grid.getFlagWall(i), true, msg);
        assert.strictEqual(grid.getFlagClosed(i), true, msg);
        assert.strictEqual(grid.getFlagVisited(i), true, msg);
        grid.setFlagVisited(i, false);
        assert.strictEqual(grid.getFlagWall(i), true, msg);
        assert.strictEqual(grid.getFlagClosed(i), true, msg);
        assert.strictEqual(grid.getFlagVisited(i), false, msg);
        grid.setFlagClosed(i, false);
        assert.strictEqual(grid.getFlagWall(i), true, msg);
        assert.strictEqual(grid.getFlagClosed(i), false, msg);
        assert.strictEqual(grid.getFlagVisited(i), false, msg);
      }
    });

  });
});
