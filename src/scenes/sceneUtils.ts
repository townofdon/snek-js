import P5 from "p5";
import { FontsInstance, GameState, SFXInstance, Scene, SceneCallbacks } from "../types";

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
export const buildSceneActionFactory = (p5: P5, gfx: P5.Graphics, sfx: SFXInstance, fonts: FontsInstance, state: GameState) =>
  (onScene?: (p5: P5, gfx: P5.Graphics, sfx: SFXInstance, fonts: FontsInstance, callbacks: SceneCallbacks) => Scene) => {
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
