import P5 from 'p5';

import '../preview/events';

import {
  DIMENSIONS,
  FRAMERATE,
} from '../constants';
import { SpriteRenderer } from '../engine/spriteRenderer';
import { Fonts } from '../fonts';
import { getLevelById } from '@/levels/levelUtils';
import { Episode } from '@/types';
import { buildLevelTree, Node } from './buildLevelTree';

const parseEpisode = (val: string) => {
  if (!val) throw new Error('episode param required.');
  switch (val.toLowerCase()) {
    case 'e1':
      return Episode.E1;
    case 'e2':
      return Episode.E2;
    case 'e3':
      return Episode.E3;
    default:
      throw new Error(`Invalid episode: ${val}`);
  }
}

const query = new URLSearchParams(window.location.search);
const level = getLevelById(query.get('level'));
const episode = parseEpisode(query.get('episode'));
const tree = buildLevelTree(level, episode);

console.log(tree);

export const sketch = (p5: P5) => {
  const fonts = new Fonts(p5);
  const spriteRenderer = new SpriteRenderer({ p5 });
  const pos = { x: 0, y: 0 };

  /**
   * https://p5js.org/reference/#/p5/preload
   */
  p5.preload = preload;
  function preload() {
    fonts.load();
    spriteRenderer.loadImages();
  }

  /**
   * https://p5js.org/reference/#/p5/setup
   */
  p5.setup = setup;
  function setup() {
    const canvas = document.getElementById("game-canvas");
    if (!canvas) throw new Error('could not find canvas with id="game-canvas"');
    p5.createCanvas(DIMENSIONS.x, DIMENSIONS.y, p5.P2D, canvas);
    p5.frameRate(FRAMERATE);
  }

  /**
   * https://p5js.org/reference/#/p5/draw
   * called by window.requestAnimationFrame
   */
  p5.draw = draw;
  function draw() {
    // prevent freezing due to animation frame build up if tab loses focus
    if (p5.deltaTime > 3000) return;

    p5.background(20);
    p5.fill(220);
    p5.textSize(12);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.textFont(fonts.variants.miniMood);
    p5.randomSeed(12345);

    // p5.text("Hello, World!", DIMENSIONS.x / 2, DIMENSIONS.y / 2);

    const offsetx = 20 - pos.x;
    const offsety = 20 - pos.y;
    const colwidth = 30;
    const lineheight = 8;

    const orange = () => {
      p5.fill(220, 180, 0);
      p5.stroke(220, 180, 0);
    }
    const white = () => {
      p5.fill(220);
      p5.stroke(220);
    }
    const randomColor = () => {
      let r = 0, g = 0, b = 0;
      while ((r + g + b) < 150) {
        r = p5.random() * 256;
        g = p5.random() * 256;
        b = p5.random() * 256;
      }
      p5.fill(r, g, b);
      p5.stroke(r, g, b);
    }

    const label = (x: number, y: number, text: string) => {
      orange();
      p5.strokeWeight(0);
      p5.text(text, x * colwidth, y * lineheight);
    }
    const line = (x0: number, y0: number, x1: number, y1: number) => {
      randomColor();
      p5.strokeWeight(2);
      p5.line(
        x0 * colwidth + 2,
        y0 * lineheight,
        x1 * colwidth + 2,
        y1 * lineheight,
      );
    }
    const rect = (x: number, y: number, w: number, h: number) => {
      p5.fill(20);
      p5.stroke(20);
      const padding = 5;
      p5.rect(x * colwidth - padding, y * lineheight - padding, w + padding * 2, h + padding * 2);
    }

    p5.push()
    p5.translate(offsetx, offsety);

    const queue: Node[] = []
    const seen: Record<string, number> = {}
    const process = (cur: Node) => {
      if (seen[cur.id] > 3) return;
      seen[cur.id] ||= 0;
      seen[cur.id]++;
      cur.next.forEach((next, i) => {
        if (i === 0) {
          queue.unshift(next);
        } else {
          queue.push(next);
        }
        line(cur.x + 2, cur.y, next.x + 2, next.y);
      });
      const width = p5.textWidth(cur.name);
      rect(cur.x, cur.y, width, 5);
      label(cur.x, cur.y, cur.name);
    }

    queue.push(tree);

    while (queue.length > 0) {
      const cur = queue.shift();
      process(cur);
    }

    p5.pop();
  }

  /**
   * https://p5js.org/reference/#/p5/keyPressed
   */
  p5.keyPressed = keyPressed;
  function keyPressed(ev?: KeyboardEvent) {
    // handle input
  }

  window.addEventListener('wheel', (event) => {
    const dy = event.deltaY; 
    const dx = event.deltaX;
    pos.x += dx;
    pos.y += dy;
  });
}
