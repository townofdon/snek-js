import assert from "assert";
import { Vector } from "p5";

import { VectorList } from "../../collections/vectorList"
import { getCoordIndex2 } from "../../utils";

describe("Collections", () => {
  describe("VectorList", () => {
    it("should initialize", () => {
      const points = new VectorList();
      assert.strictEqual(points.length, 0);
      assert.strictEqual(points.getLength(), 0);
    });

    it("should reset", () => {
      const points = new VectorList();
      assert.strictEqual(points.getLength(), 0);
      points.add(0, 0);
      points.add(1, 1);
      points.add(2, 2);
      points.add(3, 3);
      points.add(4, 4);
      points.reset();
      assert.strictEqual(points.getLength(), 0);
      assert.strictEqual(points.get(0), undefined);
      assert.strictEqual(points.get(1), undefined);
      assert.strictEqual(points.get(2), undefined);
      assert.strictEqual(points.get(3), undefined);
      assert.strictEqual(points.get(4), undefined);
      assert.strictEqual(points.find(0, 0), undefined);
      assert.strictEqual(points.find(1, 1), undefined);
      assert.strictEqual(points.find(2, 2), undefined);
      assert.strictEqual(points.find(3, 3), undefined);
      assert.strictEqual(points.find(4, 4), undefined);
    });

    it("should add elements", () => {
      const points = new VectorList();
      assert.strictEqual(points.getLength(), 0);
      points.add(0, 0);
      points.add(1, 1);
      points.add(2, 2);
      points.add(3, 3);
      points.add(4, 4);
      assert.strictEqual(points.getLength(), 5);
      assert((new Vector(0, 0)).equals(points.get(0)));
      assert((new Vector(1, 1)).equals(points.get(1)));
      assert((new Vector(2, 2)).equals(points.get(2)));
      assert((new Vector(3, 3)).equals(points.get(3)));
      assert((new Vector(4, 4)).equals(points.get(4)));
    });

    it("should add elements as vectors", () => {
      const points = new VectorList();
      assert.strictEqual(points.length, 0);
      points.addVec(new Vector(0, 0));
      points.addVec(new Vector(1, 1));
      points.addVec(new Vector(2, 2));
      points.addVec(new Vector(3, 3));
      points.addVec(new Vector(4, 4));
      assert.strictEqual(points.length, 5);
      assert((new Vector(0, 0)).equals(points.get(0)));
      assert((new Vector(1, 1)).equals(points.get(1)));
      assert((new Vector(2, 2)).equals(points.get(2)));
      assert((new Vector(3, 3)).equals(points.get(3)));
      assert((new Vector(4, 4)).equals(points.get(4)));
    });

    it("should remove elements", () => {
      const points = new VectorList();
      assert.strictEqual(points.length, 0);
      points.add(0, 0);
      points.add(1, 10);
      points.add(2, 20);
      points.remove(10);
      points.remove(20);
      points.remove(30);
      points.remove(40);
      assert.strictEqual(points.length, 3);
      assert((new Vector(0, 0)).equals(points.get(0)));
      assert((new Vector(1, 10)).equals(points.get(1)));
      assert((new Vector(2, 20)).equals(points.get(2)));
      points.remove(1);
      assert.strictEqual(points.length, 2);
      assert((new Vector(0, 0)).equals(points.get(0)));
      assert((new Vector(2, 20)).equals(points.get(1)));
      points.remove(0);
      assert.strictEqual(points.length, 1);
      assert((new Vector(2, 20)).equals(points.get(0)));
      points.remove(0);
      assert.strictEqual(points.length, 0);
      assert.strictEqual(points.get(0), undefined);
      points.remove(0);
      points.remove(1);
      points.remove(2);
      points.remove(3);
      points.remove(4);
      points.remove(-1);
      assert.strictEqual(points.length, 0);
      assert.strictEqual(points.get(0), undefined);
    });

    it("should find a point", () => {
      const points = new VectorList();
      assert.strictEqual(points.getLength(), 0);
      points.add(50, 0);
      points.add(1, 10);
      points.add(2, 30);
      assert.strictEqual(points.find(3, 3), undefined);
      assert((new Vector(50, 0)).equals(points.find(50, 0)));
      assert((new Vector(1, 10)).equals(points.find(1, 10)));
      assert((new Vector(2, 30)).equals(points.find(2, 30)));
    });

    it("should contain a point", () => {
      const points = new VectorList();
      assert.strictEqual(points.getLength(), 0);
      points.add(30, 0);
      points.add(11, 11);
      points.add(22, 22);
      assert.strictEqual(points.contains(30, 0), true);
      assert.strictEqual(points.contains(11, 11), true);
      assert.strictEqual(points.contains(22, 22), true);
      assert.strictEqual(points.contains(0, 0), false);
      assert.strictEqual(points.contains(10, 11), false);
      assert.strictEqual(points.contains(30, 30), false);
      assert.strictEqual(points.contains(21, 22), false);
      assert.strictEqual(points.contains(22, 23), false);
    });

    it("should eval predicate for every", () => {
      const points = new VectorList();
      assert.strictEqual(points.length, 0);
      points.add(5, 5);
      points.add(4, 4);
      points.add(6, 6);
      assert.strictEqual(points.length, 3);
      assert.strictEqual(points.every(point => !(new Vector(0, 0)).equals(point)), true);
      assert.strictEqual(points.every(point => !(new Vector(1, 1)).equals(point)), true);
      assert.strictEqual(points.every(point => !(new Vector(2, 2)).equals(point)), true);
      assert.strictEqual(points.every(point => !(new Vector(3, 3)).equals(point)), true);
      assert.strictEqual(points.every(point => !(new Vector(4, 4)).equals(point)), false);
      assert.strictEqual(points.every(point => !(new Vector(5, 5)).equals(point)), false);
      assert.strictEqual(points.every(point => !(new Vector(6, 6)).equals(point)), false);
      assert.strictEqual(points.every(point => !(new Vector(7, 7)).equals(point)), true);
    });

    it("should eval predicate for some", () => {
      const points = new VectorList();
      assert.strictEqual(points.length, 0);
      points.add(5, 5);
      points.add(4, 4);
      points.add(6, 6);
      assert.strictEqual(points.length, 3);
      assert.strictEqual(points.some(point => (new Vector(0, 0)).equals(point)), false);
      assert.strictEqual(points.some(point => (new Vector(1, 1)).equals(point)), false);
      assert.strictEqual(points.some(point => (new Vector(2, 2)).equals(point)), false);
      assert.strictEqual(points.some(point => (new Vector(3, 3)).equals(point)), false);
      assert.strictEqual(points.some(point => (new Vector(4, 4)).equals(point)), true);
      assert.strictEqual(points.some(point => (new Vector(5, 5)).equals(point)), true);
      assert.strictEqual(points.some(point => (new Vector(6, 6)).equals(point)), true);
      assert.strictEqual(points.some(point => (new Vector(7, 7)).equals(point)), false);
    });

    it("should contain a position", () => {
      const points = new VectorList();
      assert.strictEqual(points.length, 0);
      points.add(5, 5);
      points.add(4, 4);
      points.add(6, 6);
      assert.strictEqual(points.length, 3);
      assert.strictEqual(points.contains(0, 0), false);
      assert.strictEqual(points.contains(1, 1), false);
      assert.strictEqual(points.contains(2, 2), false);
      assert.strictEqual(points.contains(3, 3), false);
      assert.strictEqual(points.contains(4, 4), true);
      assert.strictEqual(points.contains(5, 5), true);
      assert.strictEqual(points.contains(6, 6), true);
      assert.strictEqual(points.contains(7, 7), false);
    });

    it("should contain a coord", () => {
      const points = new VectorList();
      assert.strictEqual(points.length, 0);
      points.add(5, 5);
      points.add(4, 4);
      points.add(6, 6);
      assert.strictEqual(points.length, 3);
      assert.strictEqual(points.containsCoord(getCoordIndex2(0, 0)), false);
      assert.strictEqual(points.containsCoord(getCoordIndex2(1, 1)), false);
      assert.strictEqual(points.containsCoord(getCoordIndex2(2, 2)), false);
      assert.strictEqual(points.containsCoord(getCoordIndex2(3, 3)), false);
      assert.strictEqual(points.containsCoord(getCoordIndex2(4, 4)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(5, 5)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(6, 6)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(7, 7)), false);
    });

    it("should not mutate vec passed to addVec", () => {
      const vec = new Vector(5, 5);
      const points = new VectorList();
      assert.strictEqual(points.length, 0);
      points.addVec(vec);
      vec.set(2, 2);
      assert.strictEqual(vec.x, 2);
      assert.strictEqual(vec.y, 2);
      assert.strictEqual(points.get(0).x, 5);
      assert.strictEqual(points.get(0).y, 5);
    });

    it("should update a point", () => {
      const points = new VectorList();
      assert.strictEqual(points.length, 0);
      points.add(5, 5);
      points.add(4, 4);
      points.add(3, 3);
      points.add(7, 7);
      points.add(1, 1);
      assert.strictEqual(points.length, 5);
      assert.strictEqual((new Vector(3, 3)).equals(points.get(2)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(1, 1)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(2, 2)), false);
      assert.strictEqual(points.containsCoord(getCoordIndex2(3, 3)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(4, 4)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(5, 5)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(6, 6)), false);
      assert.strictEqual(points.containsCoord(getCoordIndex2(7, 7)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(20, 20)), false);
      points.set(2, 20, 20);
      points.set(3, 0, 0);
      assert.strictEqual(points.containsCoord(getCoordIndex2(3, 3)), false);
      assert.strictEqual((new Vector(3, 3)).equals(points.get(2)), false);
      assert.strictEqual((new Vector(20, 20)).equals(points.get(2)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(1, 1)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(2, 2)), false);
      assert.strictEqual(points.containsCoord(getCoordIndex2(3, 3)), false);
      assert.strictEqual(points.containsCoord(getCoordIndex2(4, 4)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(5, 5)), true);
      assert.strictEqual(points.containsCoord(getCoordIndex2(6, 6)), false);
      assert.strictEqual(points.containsCoord(getCoordIndex2(7, 7)), false);
      assert.strictEqual(points.containsCoord(getCoordIndex2(20, 20)), true);
    });
  });
})
