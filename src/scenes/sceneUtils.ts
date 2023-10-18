import P5 from "p5";
import { FontsInstance, GameState, Scene, SceneCallbacks } from "../types";


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
export const buildSceneActionFactory = (p5: P5, fonts: FontsInstance, state: GameState) => (onScene: (p5: P5, fonts: FontsInstance, callbacks: SceneCallbacks) => Scene) => onScene
    ? () => new Promise<void>((resolve, reject) => {
        try {
            const onSceneEnded = () => {
                resolve()
            }
            onScene(p5, fonts, { onSceneEnded });
        } catch (err) {
            reject(err)
        }
    })
    : () => Promise.resolve()
