import P5 from "p5";
import { FontsInstance, ISFX, Scene, SceneCallbacks, Sound } from "../types";
import { getGamepad, wasPressedThisFrame } from "@/engine/gamepad";
import { Button } from "@/engine/gamepad/StandardGamepadMapping";
import { Coroutines } from "@/engine/coroutines";
import { DIMENSIONS } from "@/constants";
import { clamp } from "@/utils";

const AUTHOR_PADDING = 15;
const TSMOD = 2 * 0.8;

/**
 * USAGE
 * 
 * ```
 * const buildSceneAction = buildSceneActionFactory(p5, fonts, state);
 * // invoke scene action
 * buildSceneAction(level.titleScene)()
 * 
 * // can also chain scene actions:
 * buildSceneAction(level.storyScene)().then(buildSceneAction(level.titleScene))
 * ```
 */
export const buildSceneActionFactory = (p5: P5, gfx: P5.Graphics, sfx: ISFX, fonts: FontsInstance) =>
  (onScene?: (p5: P5, gfx: P5.Graphics, sfx: ISFX, fonts: FontsInstance, callbacks: SceneCallbacks) => Scene) => {
    return () => new Promise<void>((resolve, reject) => {
      if (!onScene) {
        resolve();
        return;
      }
      try {
        const onSceneEnded = () => {
          resolve()
        }
        onScene(p5, gfx, sfx, fonts, { onSceneEnded });
      } catch (err) {
        reject(err)
      }
    });
  }

export interface StartSceneDialogTextArgs {
  p5: P5,
  gfx: P5 | P5.Graphics,
  sfx: ISFX,
  coroutines: Coroutines,
  fonts: FontsInstance,
  text: string,
  rect: [number, number, number, number],
  authorText?: string,
  delayAfter?: number,
  drawPressAnyKey?: (p5: P5, fonts: FontsInstance) => void,

}
export function * startSceneDialogText({ p5, gfx, sfx, coroutines, fonts, text, authorText, rect, delayAfter, drawPressAnyKey }: StartSceneDialogTextArgs) {
  // since we are overriding p5 input handlers, initialize input state before responding below
  p5.keyIsPressed = false;

  // play sound as parallel coroutine to *action()
  const playingSound = coroutines.start(playTextSoundLoop(coroutines, sfx));
  const numLetters = text.length;
  for (let j = 1; j <= numLetters; j++) {
    const skip = (
      (p5.keyIsPressed && p5.keyIsDown(p5.ENTER)) ||
      wasPressedThisFrame(getGamepad(), Button.Start) ||
      wasPressedThisFrame(getGamepad(), Button.South)
    )
    if (j > 5 && skip) {
      // wait one frame
      drawPartialQuote(gfx, fonts, text, j, rect);
      yield null;
      break;
    }
    yield* coroutines.waitForTime(15, () => {
      drawPartialQuote(gfx, fonts, text, j, rect);
    });
  }
  coroutines.stop(playingSound);

  const paragraphHeight = estimateParagraphHeight(gfx, text, 2 * 250, fonts.variants.miniMood, 14);

  if (drawPressAnyKey) {
    yield* coroutines.waitForAnyKey(() => {
      if (authorText) {
        drawAuthor(gfx, fonts, paragraphHeight, authorText, rect);
      }
      drawPartialQuote(gfx, fonts, text, numLetters, rect);
      drawPressAnyKey(gfx, fonts);
    });
  }

  if (delayAfter && delayAfter > 0) {
    let t = 0;
    while (t < delayAfter) {
      const skip = (
        (p5.keyIsPressed && p5.keyIsDown(p5.ENTER)) ||
        wasPressedThisFrame(getGamepad(), Button.Start) ||
        wasPressedThisFrame(getGamepad(), Button.South)
      )
      if (skip) {
        break;
      }
      if (authorText) {
        drawAuthor(gfx, fonts, paragraphHeight, authorText, rect);
      }
      drawPartialQuote(gfx, fonts, text, numLetters, rect);
      t += clamp(gfx.deltaTime, 16, 64);
      yield null;
    }
  }
}

function drawAuthor(gfx: P5 | P5.Graphics, fonts: FontsInstance, paragraphHeight: number, authorText: string, rect: [number, number, number, number]) {
  const [x, y, width, height] = rect;
  gfx.fill('#fff');
  gfx.noStroke();
  gfx.textFont(fonts.variants.miniMood);
  gfx.textSize(TSMOD * 12);
  gfx.textAlign(gfx.RIGHT, gfx.TOP);
  gfx.text('- ' + authorText, x, y + paragraphHeight + AUTHOR_PADDING, width, height);
}

function drawPartialQuote(gfx: P5 | P5.Graphics, fonts: FontsInstance, quote: string, numLetters: number, rect: [number, number, number, number]) {
  gfx.fill('#fff');
  gfx.noStroke();
  gfx.textFont(fonts.variants.miniMood);
  gfx.textSize(TSMOD * 14);
  gfx.textAlign(gfx.LEFT, gfx.TOP);
  gfx.text(quote.substring(0, numLetters), ...rect);
}

export function drawPressAnyKey(gfx: P5 | P5.Graphics, fonts: FontsInstance, x: number, y: number) {
  gfx.fill('#fff');
  gfx.noStroke();
  gfx.textFont(fonts.variants.miniMood);
  gfx.textSize(TSMOD * 14);
  gfx.textAlign(gfx.CENTER, gfx.TOP);
  gfx.fill('#fff');
  gfx.text('[PRESS ANY KEY]', ...getPosition(x, y));
}

export const getPosition = (x: number, y: number): [number, number] => {
  const x1 = DIMENSIONS.x * x;
  const y1 = DIMENSIONS.y * y;
  return [x1, y1];
}

export const getRect = (x: number, y: number, width: number, height: number): [number, number, number, number] => {
  const x1 = DIMENSIONS.x * x - width / 2;
  const y1 = DIMENSIONS.y * y - height / 2;
  return [x1, y1, width, height];
}

// const getQuoteRect = () => {
//   // return getRect(0.5, 0.575, 250, 250);
//   return getRect(0.5, 0.575, 2 * 250, 2 * 250);
// }

const estimateParagraphHeight = (p5: P5 | P5.Graphics, paragraph: string, rectWidth: number, font: P5.Font, textSize: number) => {
  const numLines = estimateNumLines(p5, paragraph, rectWidth, font, textSize);
  return p5.textLeading() * numLines;
}

const estimateNumLines = (p5: P5 | P5.Graphics, paragraph: string, rectWidth: number, font: P5.Font, textSize: number) => {
  p5.textFont(font);
  p5.textSize(TSMOD * textSize);

  paragraph = paragraph.trim();
  let cursorStart = 0;
  let cursorLastSpaceFound = 0;
  let cursorEnd = 1;
  let numLines = 1;

  while (cursorEnd <= paragraph.length) {
    const currentChar = paragraph.substring(cursorEnd - 1, cursorEnd);
    if (currentChar === ' ' || currentChar === '\n' || cursorEnd === paragraph.length) {
      const testString = paragraph.substring(cursorStart, cursorEnd);
      const exceedsBounds = p5.textWidth(testString) + 5 >= rectWidth;
      if (exceedsBounds) {
        cursorStart = cursorLastSpaceFound + 1;
        numLines++;
      }
      if (currentChar === '\n') {
        cursorStart = cursorEnd;
        numLines++;
      }
      cursorLastSpaceFound = cursorEnd - 1;
    }
    cursorEnd++;
  }

  return numLines;
}

function *playTextSoundLoop(coroutines: Coroutines, sfx: ISFX) {
  while (true) {
    sfx.play(Sound.uiBlip);
    yield* coroutines.waitForTime(40);
  }
}
