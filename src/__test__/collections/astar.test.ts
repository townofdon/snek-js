import assert from "assert";

import { AStar } from '../../collections/astar'
import { GRIDCOUNT } from "../../constants";

describe("Collections", () => {
  describe("AStar", () => {
    describe("BinaryHeap", () => {
      it("should addToOpenList correctly 1", () => {
        const astar = new AStar();
        astar.test__setOpenListData([11, 22, 33, 44, 55]);
        astar.test__setScores({
          11: 0,
          22: 2,
          33: 3,
          44: 4,
          55: 5,
          66: 6,
        }, {
          11: 0,
          22: 0,
          33: 0,
          44: 0,
          55: 0,
          66: 0,
        });
        astar.test__addToOpenList(66);
        const result = astar.test__getOpenListData();
        assert.deepStrictEqual(result, [11, 22, 33, 44, 55, 66]);
      });

      it("should addToOpenList correctly 2", () => {
        const astar = new AStar();
        astar.test__setOpenListData([11, 22, 33, 44, 55]);
        astar.test__setScores({
          11: 0,
          22: 2,
          33: 3,
          44: 5,
          55: 6,
          66: 4, // not less than parent
        }, {
          11: 0,
          22: 0,
          33: 0,
          44: 0,
          55: 0,
          66: 0,
        });
        astar.test__addToOpenList(66);
        const result = astar.test__getOpenListData();
        assert.deepStrictEqual(result, [11, 22, 33, 44, 55, 66]);
      });

      it("should addToOpenList correctly 3", () => {
        const astar = new AStar();
        astar.test__setOpenListData([11, 22, 33, 44, 55]);
        astar.test__setScores({
          11: 0,
          22: 2,
          33: 5,
          44: 6,
          55: 7,
          66: 4, // IS less than parent
        }, {
          11: 0,
          22: 0,
          33: 0,
          44: 0,
          55: 0,
          66: 0,
        });
        astar.test__addToOpenList(66);
        const result = astar.test__getOpenListData();
        assert.deepStrictEqual(result, [11, 22, 66, 44, 55, 33]);
      });

      it("should addToOpenList correctly 4", () => {
        const astar = new AStar();
        astar.test__setOpenListData([11, 22, 33, 44, 55]);
        astar.test__setScores({
          11: 5,
          22: 6,
          33: 7,
          44: 8,
          55: 9,
          66: 4, // IS less root node
        }, {
          11: 0,
          22: 0,
          33: 0,
          44: 0,
          55: 0,
          66: 0,
        });
        astar.test__addToOpenList(66);
        const result = astar.test__getOpenListData();
        assert.deepStrictEqual(result, [66, 22, 11, 44, 55, 33]);
      });

      it("should extract correctly", () => {
        const astar = new AStar();
        astar.test__setOpenListData([11, 22, 33, 44, 55]);
        astar.test__setScores({
          11: 1,
          22: 2,
          33: 3,
          44: 4,
          55: 5,
        }, {
          11: 0,
          22: 0,
          33: 0,
          44: 0,
          55: 0,
        });
        assert.strictEqual(astar.test__extractMinFromOpenList(), 11);
        assert.deepStrictEqual(astar.test__getOpenListData(), [22, 44, 33, 55]);
        assert.strictEqual(astar.test__extractMinFromOpenList(), 22);
        assert.deepStrictEqual(astar.test__getOpenListData(), [33, 44, 55]);
        assert.strictEqual(astar.test__extractMinFromOpenList(), 33);
        assert.deepStrictEqual(astar.test__getOpenListData(), [44, 55]);
        assert.strictEqual(astar.test__extractMinFromOpenList(), 44);
        assert.deepStrictEqual(astar.test__getOpenListData(), [55]);
        assert.strictEqual(astar.test__extractMinFromOpenList(), 55);
        assert.deepStrictEqual(astar.test__getOpenListData(), []);
      });
    });

    describe("Search", () => {
      const humanify = (path: number[]): string[] => {
        return path.map(coord => {
          const x = Math.floor(coord % GRIDCOUNT.x);
          const y = Math.floor(coord / GRIDCOUNT.x);
          return `[${x},${y}]`
        })
      }
      it("should build correct path for empty map", () => {
        const astar = new AStar();
        assert(astar.search(1, 1, 15, 29));
        const path = astar.getBestPath();
        assert.deepStrictEqual(humanify(path), [
          "[1,1]", "[2,1]", "[3,1]", "[3,2]",
          "[4,2]", "[4,3]", "[4,4]", "[4,5]",
          "[5,5]", "[6,5]", "[6,6]", "[6,7]",
          "[7,7]", "[8,7]", "[8,8]", "[8,9]",
          "[8,10]", "[8,11]", "[8,12]", "[8,13]",
          "[8,14]", "[8,15]", "[8,16]", "[9,16]",
          "[10,16]", "[10,17]", "[11,17]", "[11,18]",
          "[11,19]", "[11,20]", "[12,20]", "[13,20]",
          "[14,20]", "[14,21]", "[14,22]", "[14,23]",
          "[14,24]", "[14,25]", "[14,26]", "[15,26]",
          "[15,27]", "[15,28]", "[15,29]",
        ]);
      });

      it("should build correct path around a wall", () => {
        const astar = new AStar();
        for (let x = 10; x <= 20; x++) {
          for (let y = 10; y <= 20; y++) {
            astar.setWall(x, y);
          }
        }
        const t0 = performance.now();
        assert(astar.search(1, 15, 29, 15));
        const path = astar.getBestPath();
        const t1 = performance.now();
        console.log(`${t1 - t0}ms`);
        assert.deepStrictEqual(humanify(path), [
          '[1,15]',  '[2,15]',  '[3,15]',  '[4,15]',
          '[5,15]',  '[6,15]',  '[7,15]',  '[8,15]',
          '[9,15]',  '[9,16]',  '[9,17]',  '[9,18]',
          '[9,19]',  '[9,20]',  '[9,21]',  '[10,21]',
          '[11,21]', '[12,21]', '[13,21]', '[14,21]',
          '[15,21]', '[16,21]', '[17,21]', '[18,21]',
          '[19,21]', '[20,21]', '[21,21]', '[22,21]',
          '[23,21]', '[24,21]', '[25,21]', '[26,21]',
          '[26,20]', '[26,19]', '[26,18]', '[26,17]',
          '[27,17]', '[27,16]', '[27,15]', '[28,15]',
          '[29,15]'
        ]);
      });
    });
  });
});
