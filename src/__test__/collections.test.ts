import assert from "assert";

import { Apples } from "../collections";
import { getCoordIndex2 } from "../utils";

describe("Collections", () => {
  describe("Apples", () => {
    it("should initialize apples", () => {
      const apples = new Apples();
      assert.strictEqual(apples.getLength(), 0);
      assert.strictEqual(apples.existsAt(0, 0), false);
      assert.strictEqual(apples.existsAt(1, 1), false);
      assert.strictEqual(apples.existsAt(2, 2), false);
      assert.strictEqual(apples.existsAt(3, 3), false);
      assert.strictEqual(apples.existsAt(4, 4), false);
    });
    it("should add apples", () => {
      const apples = new Apples();
      assert.strictEqual(apples.getLength(), 0);
      assert.strictEqual(apples.existsAt(3, 3), false);
      assert.strictEqual(apples.existsAt(4, 4), false);
      apples.add(3, 3);
      apples.add(4, 4);
      assert.strictEqual(apples.getLength(), 2);
      assert.strictEqual(apples.existsAt(3, 3), true);
      assert.strictEqual(apples.existsAt(4, 4), true);
    });
    it("should remove apples", () => {
      const apples = new Apples();
      apples.add(10, 1);
      apples.add(1, 10);
      assert.strictEqual(apples.getLength(), 2);
      assert.strictEqual(apples.existsAt(10, 1), true);
      assert.strictEqual(apples.existsAt(1, 10), true);
      apples.remove(10, 1);
      assert.strictEqual(apples.getLength(), 1);
      apples.remove(1, 10);
      assert.strictEqual(apples.existsAt(10, 1), false);
      assert.strictEqual(apples.existsAt(1, 10), false);
    });
    it("should reset apples", () => {
      const apples = new Apples();
      apples.add(1, 1);
      apples.add(2, 2);
      apples.add(3, 3);
      apples.add(4, 4);
      apples.add(5, 5);
      apples.add(6, 6);
      apples.add(7, 7);
      apples.add(8, 8);
      apples.add(9, 9);
      apples.add(10, 10);
      assert.strictEqual(apples.getLength(), 10);
      assert.strictEqual(apples.existsAt(5, 5), true);
      apples.reset();
      assert.strictEqual(apples.getLength(), 0);
      assert.strictEqual(apples.existsAt(5, 5), false);
    });
    it("should allow overlapping apples", () => {
      const apples = new Apples();
      apples.add(5, 5);
      apples.add(5, 5);
      apples.add(5, 5);
      apples.add(5, 5);
      apples.add(5, 5);
      assert.strictEqual(apples.getLength(), 5);
      assert.strictEqual(apples.existsAt(5, 5), true);
      apples.remove(5, 5);
      assert.strictEqual(apples.getLength(), 4);
      assert.strictEqual(apples.existsAt(5, 5), true);
      apples.remove(5, 5);
      assert.strictEqual(apples.getLength(), 3);
      assert.strictEqual(apples.existsAt(5, 5), true);
      apples.remove(5, 5);
      assert.strictEqual(apples.getLength(), 2);
      assert.strictEqual(apples.existsAt(5, 5), true);
      apples.remove(5, 5);
      assert.strictEqual(apples.getLength(), 1);
      assert.strictEqual(apples.existsAt(5, 5), true);
      apples.remove(5, 5);
      assert.strictEqual(apples.getLength(), 0);
      assert.strictEqual(apples.existsAt(5, 5), false);
    });
    it("should remove apple by coord", () => {
      const apples = new Apples();
      apples.add(1, 1);
      apples.add(2, 2);
      apples.add(3, 3);
      apples.add(4, 4);
      apples.add(5, 5);
      assert.strictEqual(apples.getLength(), 5);
      assert.strictEqual(apples.existsAt(1, 1), true);
      assert.strictEqual(apples.existsAt(2, 2), true);
      assert.strictEqual(apples.existsAt(3, 3), true);
      assert.strictEqual(apples.existsAt(4, 4), true);
      assert.strictEqual(apples.existsAt(5, 5), true);
      apples.removeByCoord(getCoordIndex2(3, 3));
      assert.strictEqual(apples.getLength(), 4);
      assert.strictEqual(apples.existsAt(1, 1), true);
      assert.strictEqual(apples.existsAt(2, 2), true);
      assert.strictEqual(apples.existsAt(3, 3), false);
      assert.strictEqual(apples.existsAt(4, 4), true);
      assert.strictEqual(apples.existsAt(5, 5), true);
    });
    it("should get apple by coord", () => {
      const apples = new Apples();
      apples.add(1, 1);
      apples.add(2, 2);
      apples.add(3, 3);
      apples.add(4, 4);
      apples.add(5, 5);
      assert.strictEqual(apples.getLength(), 5);
      assert.strictEqual(apples.existsAtCoord(getCoordIndex2(0, 0)), false);
      assert.strictEqual(apples.existsAtCoord(getCoordIndex2(1, 1)), true);
      assert.strictEqual(apples.existsAtCoord(getCoordIndex2(2, 2)), true);
      assert.strictEqual(apples.existsAtCoord(getCoordIndex2(3, 3)), true);
      assert.strictEqual(apples.existsAtCoord(getCoordIndex2(4, 4)), true);
      assert.strictEqual(apples.existsAtCoord(getCoordIndex2(5, 5)), true);
      assert.strictEqual(apples.existsAtCoord(getCoordIndex2(6, 6)), false);
    });
  });
});