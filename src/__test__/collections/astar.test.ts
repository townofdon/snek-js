import assert from "assert";

import { AStar } from '../../collections/astar'
import { GRIDCOUNT } from "../../constants";
import { getCoordIndex2 } from "../../utils";
import { AnimationList } from "../../collections/animationList";

const DEBUG = process.env.DEBUG;

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
        const result = astar.search(1, 1, 15, 29);
        if (DEBUG) astar.debugPrint();
        assert(result);
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
        const result = astar.search(1, 15, 29, 15);
        if (DEBUG) astar.debugPrint();
        assert(result);
        const path = astar.getBestPath();
        assert.deepStrictEqual(humanify(path), [
            '[1,15]',  '[2,15]',  '[3,15]',  '[4,15]',
            '[5,15]',  '[6,15]',  '[7,15]',  '[8,15]',
            '[9,15]',  '[9,14]',  '[9,13]',  '[9,12]',
            '[9,11]',  '[9,10]',  '[9,9]',   '[10,9]',
            '[11,9]',  '[12,9]',  '[13,9]',  '[14,9]',
            '[15,9]',  '[16,9]',  '[17,9]',  '[18,9]',
            '[19,9]',  '[20,9]',  '[21,9]',  '[22,9]',
            '[23,9]',  '[24,9]',  '[25,9]',  '[26,9]',
            '[27,9]',  '[28,9]',  '[28,10]', '[28,11]',
            '[28,12]', '[28,13]', '[29,13]', '[29,14]',
            '[29,15]'
        ]);
      });

      it("should return false if no valid path found", () => {
        const astar = new AStar();
        astar.setWall(28, 29);
        astar.setWall(28, 28);
        astar.setWall(29, 28);
        assert.strictEqual(astar.search(1, 1, 29, 29), false);
      });

      it("should search with diagonals", () => {
        const astar = new AStar({ allowDiagonals: true });
        const result = astar.search(1, 1, 29, 29);
        if (DEBUG) astar.debugPrint();
        assert(result);
        const path = astar.getBestPath();
        assert.deepStrictEqual(humanify(path), [
          '[1,1]',
          '[2,2]',
          '[3,3]',
          '[4,4]',
          '[5,5]',
          '[6,6]',
          '[7,7]',
          '[8,8]',
          '[9,9]',
          '[10,10]',
          '[11,11]',
          '[12,12]',
          '[13,13]',
          '[14,14]',
          '[15,15]',
          '[16,16]',
          '[17,17]',
          '[18,18]',
          '[19,19]',
          '[20,20]',
          '[21,21]',
          '[22,22]',
          '[23,23]',
          '[24,24]',
          '[25,25]',
          '[26,26]',
          '[27,27]',
          '[28,28]',
          '[29,29]',
        ]);
      });

      it("should search with diagonals past walls", () => {
        const astar = new AStar({ allowDiagonals: true });
        for (let x = 10; x <= 20; x++) {
          for (let y = 10; y <= 20; y++) {
            astar.setWall(x, y);
          }
        }
        const result = astar.search(1, 15, 29, 15);
        if (DEBUG) astar.debugPrint();
        assert(result);
        const path = astar.getBestPath();
        assert.deepStrictEqual(humanify(path), [
          '[1,15]',  '[2,15]',  '[3,15]',
          '[4,15]',  '[5,16]',  '[6,17]',
          '[7,18]',  '[8,19]',  '[9,20]',
          '[10,21]', '[11,21]', '[12,21]',
          '[13,21]', '[14,21]', '[15,21]',
          '[16,21]', '[17,21]', '[18,21]',
          '[19,21]', '[20,21]', '[21,20]',
          '[22,19]', '[23,18]', '[24,17]',
          '[25,16]', '[26,15]', '[27,15]',
          '[28,15]', '[29,15]'
        ]);
      });

      it("should search and return closest path", () => {
        const astar = new AStar({ allowClosest: true });
        astar.setWall(28, 29);
        astar.setWall(28, 28);
        astar.setWall(29, 28);
        const result = astar.search(2, 2, 29, 29);
        if (DEBUG) astar.debugPrint();
        assert(result);
        const path = astar.getLatestPath();
        assert.deepStrictEqual(humanify(path), [
          '[2,2]',   '[3,2]',   '[4,2]',   '[4,3]',
          '[5,3]',   '[6,3]',   '[7,3]',   '[8,3]',
          '[9,3]',   '[10,3]',  '[11,3]',  '[12,3]',
          '[13,3]',  '[14,3]',  '[15,3]',  '[16,3]',
          '[17,3]',  '[18,3]',  '[18,4]',  '[19,4]',
          '[19,5]',  '[20,5]',  '[20,6]',  '[20,7]',
          '[20,8]',  '[21,8]',  '[22,8]',  '[23,8]',
          '[23,9]',  '[23,10]', '[23,11]', '[23,12]',
          '[23,13]', '[23,14]', '[23,15]', '[23,16]',
          '[23,17]', '[23,18]', '[23,19]', '[23,20]',
          '[23,21]', '[23,22]', '[23,23]', '[23,24]',
          '[23,25]', '[23,26]', '[23,27]', '[23,28]',
          '[23,29]', '[24,29]', '[25,29]', '[26,29]',
          '[27,29]'
        ]);
      });

      it("should search and return closest path with diagonals", () => {
        const astar = new AStar({ allowClosest: true, allowDiagonals: true });
        astar.setWall(28, 29);
        astar.setWall(28, 28);
        astar.setWall(29, 28);
        const result = astar.search(2, 2, 29, 29);
        if (DEBUG) astar.debugPrint();
        assert(result);
        const path = astar.getLatestPath();
        assert.deepStrictEqual(humanify(path), [
          '[2,2]',   '[3,3]',   '[4,4]',
          '[5,5]',   '[6,6]',   '[7,7]',
          '[8,8]',   '[9,9]',   '[10,10]',
          '[11,11]', '[12,12]', '[13,13]',
          '[14,14]', '[15,15]', '[16,16]',
          '[17,17]', '[18,18]', '[19,19]',
          '[20,20]', '[21,21]', '[22,22]',
          '[23,23]', '[24,24]', '[25,25]',
          '[26,26]', '[27,27]', '[28,27]',
          '[29,27]'
        ]);
      });

      it("should search and avoid snek threat", () => {
        const astar = new AStar();
        const snek = getCoordIndex2(15, 15);
        astar.setSnekCoord(snek);
        const result = astar.search(1, 1, 28, 28);
        if (DEBUG) astar.debugPrint();
        assert(result);
        const path = astar.getLatestPath();
        assert(!path.includes(snek), `snek exists at coord(15, 15)!`);
      });

      it("should search and avoid snek threat with diagonals", () => {
        const astar = new AStar({ allowDiagonals: true });
        const snek = getCoordIndex2(15, 15);
        astar.setSnekCoord(snek);
        const result = astar.search(1, 1, 28, 28);
        if (DEBUG) astar.debugPrint();
        assert(result);
        const path = astar.getLatestPath();
        assert(!path.includes(snek), `snek exists at coord(15, 15)!`);
      });

      it("should search and avoid mine threats", () => {
        const mines = new AnimationList();
        const astar = new AStar({ mines });
        mines.add(3, 3, 999999, 1, 1);
        mines.add(2, 5, 999999, 1, 1);
        mines.add(0, 6, 999999, 1, 1);
        mines.add(6, 0, 999999, 1, 1);
        mines.add(9, 9, 999999, 1, 1);
        mines.add(6, 12, 999999, 1, 1);
        mines.add(12, 6, 999999, 1, 1);
        mines.add(15, 3, 999999, 1, 1);
        mines.add(15, 2, 999999, 1, 1);
        mines.add(15, 1, 999999, 1, 1);
        mines.add(3, 20, 999999, 1, 1);
        mines.add(28, 20, 999999, 1, 1);
        const result = astar.search(1, 1, 28, 28);
        if (DEBUG) astar.debugPrint();
        assert(result);
        const path = astar.getLatestPath();
        path.forEach((coord, idx) => {
          const x = Math.floor(coord % GRIDCOUNT.x);
          const y = Math.floor(coord / GRIDCOUNT.x);
          assert(!mines.existsAtCoord(coord), `mine exists at coord(${x}, ${y})! path_index=${idx}`);
        });
      });

      it("should search and avoid mine threats with diagonals", () => {
        const mines = new AnimationList();
        const astar = new AStar({ mines, allowDiagonals: true });
        mines.add(3, 3, 999999, 1, 1);
        mines.add(2, 5, 999999, 1, 1);
        mines.add(0, 6, 999999, 1, 1);
        mines.add(6, 0, 999999, 1, 1);
        mines.add(9, 9, 999999, 1, 1);
        mines.add(6, 12, 999999, 1, 1);
        mines.add(12, 6, 999999, 1, 1);
        mines.add(15, 3, 999999, 1, 1);
        mines.add(15, 2, 999999, 1, 1);
        mines.add(15, 1, 999999, 1, 1);
        mines.add(3, 20, 999999, 1, 1);
        mines.add(28, 20, 999999, 1, 1);
        mines.add(15, 15, 999999, 1, 1);
        mines.add(16, 14, 999999, 1, 1);
        mines.add(17, 13, 999999, 1, 1);
        mines.add(18, 12, 999999, 1, 1);
        mines.add(19, 11, 999999, 1, 1);
        mines.add(20, 10, 999999, 1, 1);
        mines.add(21, 9, 999999, 1, 1);
        mines.add(22, 8, 999999, 1, 1);
        mines.add(23, 7, 999999, 1, 1);
        mines.add(24, 6, 999999, 1, 1);
        mines.add(25, 5, 999999, 1, 1);
        mines.add(16, 15, 999999, 1, 1);
        mines.add(17, 14, 999999, 1, 1);
        mines.add(18, 13, 999999, 1, 1);
        mines.add(19, 12, 999999, 1, 1);
        mines.add(20, 11, 999999, 1, 1);
        mines.add(21, 10, 999999, 1, 1);
        mines.add(22, 9, 999999, 1, 1);
        mines.add(23, 8, 999999, 1, 1);
        mines.add(24, 7, 999999, 1, 1);
        mines.add(25, 6, 999999, 1, 1);
        mines.add(26, 5, 999999, 1, 1);
        const result = astar.search(1, 1, 28, 28);
        if (DEBUG) astar.debugPrint();
        assert(result);
        const path = astar.getLatestPath();
        path.forEach((coord, idx) => {
          const x = Math.floor(coord % GRIDCOUNT.x);
          const y = Math.floor(coord / GRIDCOUNT.x);
          assert(!mines.existsAtCoord(coord), `mine exists at coord(${x}, ${y})! path_index=${idx}`);
        });
      });

      it("should search with all manner of threats", () => {
        const mines = new AnimationList();
        const astar = new AStar({ mines, allowDiagonals: true });
        const snek = getCoordIndex2(15, 15);
        astar.setSnekCoord(snek);
        mines.add(3, 3, 999999, 1, 1);
        mines.add(2, 5, 999999, 1, 1);
        mines.add(0, 6, 999999, 1, 1);
        mines.add(6, 0, 999999, 1, 1);
        mines.add(9, 9, 999999, 1, 1);
        mines.add(6, 12, 999999, 1, 1);
        mines.add(12, 6, 999999, 1, 1);
        mines.add(15, 3, 999999, 1, 1);
        mines.add(15, 2, 999999, 1, 1);
        mines.add(15, 1, 999999, 1, 1);
        mines.add(3, 20, 999999, 1, 1);
        mines.add(28, 20, 999999, 1, 1);
        mines.add(15, 15, 999999, 1, 1);
        mines.add(16, 14, 999999, 1, 1);
        mines.add(17, 13, 999999, 1, 1);
        mines.add(18, 12, 999999, 1, 1);
        mines.add(19, 11, 999999, 1, 1);
        mines.add(20, 10, 999999, 1, 1);
        mines.add(21, 9, 999999, 1, 1);
        mines.add(22, 8, 999999, 1, 1);
        mines.add(23, 7, 999999, 1, 1);
        mines.add(24, 6, 999999, 1, 1);
        mines.add(25, 5, 999999, 1, 1);
        mines.add(16, 15, 999999, 1, 1);
        mines.add(17, 14, 999999, 1, 1);
        mines.add(18, 13, 999999, 1, 1);
        mines.add(19, 12, 999999, 1, 1);
        mines.add(20, 11, 999999, 1, 1);
        mines.add(21, 10, 999999, 1, 1);
        mines.add(22, 9, 999999, 1, 1);
        mines.add(23, 8, 999999, 1, 1);
        mines.add(24, 7, 999999, 1, 1);
        mines.add(25, 6, 999999, 1, 1);
        mines.add(26, 5, 999999, 1, 1);
        const result = astar.search(1, 1, 28, 28);
        if (DEBUG) astar.debugPrint();
        assert(result);
        const path = astar.getLatestPath();
        path.forEach((coord, idx) => {
          const x = Math.floor(coord % GRIDCOUNT.x);
          const y = Math.floor(coord / GRIDCOUNT.x);
          assert(!mines.existsAtCoord(coord), `mine exists at coord(${x}, ${y})! path_index=${idx}`);
        });
        assert(!path.includes(snek), `snek exists at coord(15, 15)!`);
      });

      const benchmark = (astar: AStar, runs: number) => {
        for (let x = 10; x <= 20; x++) {
          for (let y = 10; y <= 20; y++) {
            astar.setWall(x, y);
          }
        }
        let total = 0;
        let max = 0;
        let min = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < runs; i++) {
          const t0 = performance.now();
          astar.search(1, 1, 29, 29);
          const t1 = performance.now();
          const time = t1 - t0;
          total += time;
          if (time > max) max = time;
          if (time < min) min = time;
        }
        const avg = total / runs;
        console.log(`R${runs}:total=${total.toFixed(4)},avg=${avg.toFixed(4)},max=${max.toFixed(4)},min=${min.toFixed(4)}`);
      };

      it("benchmark manhattan", () => {
        console.log("benchmark(manhattan)");
        const astar = new AStar();
        benchmark(astar, 10);
        benchmark(astar, 100);
        benchmark(astar, 1000);
      });

      it("benchmark diagonal", () => {
        console.log("benchmark(diagonal)");
        const astar = new AStar({ allowDiagonals: true });
        benchmark(astar, 10);
        benchmark(astar, 100);
        benchmark(astar, 1000);
      });
    });
  });
});
