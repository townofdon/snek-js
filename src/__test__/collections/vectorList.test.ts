import assert from "assert";
import { Vector } from "p5";

import { VectorList } from "../../collections/vectorList"

describe("Collections", () => {
  describe("VectorList", () => {
    it("should initialize", () => {
      const points = new VectorList();
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
      assert.strictEqual(points.getLength(), 0);
      points.addVec(new Vector(0, 0));
      points.addVec(new Vector(1, 1));
      points.addVec(new Vector(2, 2));
      points.addVec(new Vector(3, 3));
      points.addVec(new Vector(4, 4));
      assert.strictEqual(points.getLength(), 5);
      assert((new Vector(0, 0)).equals(points.get(0)));
      assert((new Vector(1, 1)).equals(points.get(1)));
      assert((new Vector(2, 2)).equals(points.get(2)));
      assert((new Vector(3, 3)).equals(points.get(3)));
      assert((new Vector(4, 4)).equals(points.get(4)));
    });

    it("should remove elements", () => {
      const points = new VectorList();
      assert.strictEqual(points.getLength(), 0);
      points.add(0, 0);
      points.add(1, 10);
      points.add(2, 20);
      points.removeAt(10);
      points.removeAt(20);
      points.removeAt(30);
      points.removeAt(40);
      assert.strictEqual(points.getLength(), 3);
      assert((new Vector(0, 0)).equals(points.get(0)));
      assert((new Vector(1, 10)).equals(points.get(1)));
      assert((new Vector(2, 20)).equals(points.get(2)));
      points.removeAt(1);
      assert.strictEqual(points.getLength(), 2);
      assert((new Vector(0, 0)).equals(points.get(0)));
      assert((new Vector(2, 20)).equals(points.get(1)));
      points.removeAt(0);
      assert.strictEqual(points.getLength(), 1);
      assert((new Vector(2, 20)).equals(points.get(0)));
      points.removeAt(0);
      assert.strictEqual(points.getLength(), 0);
      assert.strictEqual(points.get(0), undefined);
      points.removeAt(0);
      points.removeAt(1);
      points.removeAt(2);
      points.removeAt(3);
      points.removeAt(4);
      points.removeAt(-1);
      assert.strictEqual(points.getLength(), 0);
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
  });
})
