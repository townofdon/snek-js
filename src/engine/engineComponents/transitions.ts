import type { Graphics } from "p5";
import {
  Boss,
  Context,
  FontsInstance,
  ReplayMode,
} from "@/types";
import { UI } from "@/ui/ui";
import { buildSceneActionFactory } from "@/scenes/sceneUtils";
import {
  allowAchievements,
  checkAchievementForLevelReached,
} from "@/achievements";
import { resumeAudioContext } from "../audio";
import { Coroutines } from "../coroutines";
import { settings } from "@/stores/SettingsStore";


export interface TransitionsParams {
  ctx: Context,
  boss: { current: Boss | null },
  shouldShowTransitions: boolean,
  gfxPresentation: Graphics,
  fonts: FontsInstance,
  actions: Coroutines,
  transition: () => Promise<void> | null,
  onTriggerWinGame?: () => void,
  startLogicLoop: () => void,
  stopLogicLoop: () => void,
  renderLoop: (gamepadInputHandled?: any) => void,
}

export function transitions({
  ctx,
  boss,
  gfxPresentation,
  fonts,
  shouldShowTransitions,
  actions,
  transition,
  onTriggerWinGame,
  startLogicLoop,
  stopLogicLoop,
  renderLoop,
}: TransitionsParams) {
  const {
    p5,
    es,
    state,
    player,
    segments,
    spriteRenderer,
    replay,
    sfx,
    musicPlayer,
    renderScoreUI,
    renderHeartsUI,
    renderLevelName,
    renderDifficultyUI,
  } = ctx;

  const bossTransition: (() => Promise<void> | undefined) = (() => {
    if (replay.mode === ReplayMode.Playback) return;
    if (!boss.current) return;
    const bossTransition = shouldShowTransitions ? boss.current.intro : boss.current.quickIntro;
    const buildSceneAction = buildSceneActionFactory(p5, gfxPresentation, sfx, fonts);
    return buildSceneAction((p5, gfx, sfx, fonts, callbacks) => {
      musicPlayer.stopAllTracks();
      const difficulty = es.difficulty.index;
      return bossTransition(p5, gfx, sfx, es, state, player, segments, difficulty, musicPlayer, fonts, spriteRenderer, callbacks, renderLoop)
    });
  })();

  stopLogicLoop();
  if (shouldShowTransitions) {
    UI.hideGfxCanvas();
    actions.stopAll();
    musicPlayer.load(es.level.musicTrack);
    musicPlayer.setVolume(1);
    transition()
      .then(bossTransition)
      .catch(err => { console.error(err); })
      .finally(() => {
        if (es.level.isWinGame) {
          state.isGameWon = true;
          state.isMoving = true;
          onTriggerWinGame();
        }
        if (es.level.moveAtLevelStart) {
          state.isMoving = true;
        }
        boss.current?.start();
        renderDifficultyUI();
        renderHeartsUI();
        renderScoreUI();
        renderLevelName();
        UI.showGfxCanvas();
        musicPlayer.stopAllTracks();
        resumeAudioContext().then(() => {
          musicPlayer.play(es.level.musicTrack);
        });
        if (allowAchievements(state, replay.mode)) {
          checkAchievementForLevelReached({
            levelId: es.level.id,
            episode: state.episode,
            difficultyIndex: es.difficulty.index,
          });
        }
        startLogicLoop();
      })
  } else {
    Promise.resolve()
      .then(bossTransition)
      .catch(err => { console.error(err); })
      .finally(() => {
        if (replay.mode !== ReplayMode.Playback && (state.isGameStarted || state.isGameStarting)) {
          if (settings.debug.disableTransitions) {
            musicPlayer.stopAllTracks();
          }
          musicPlayer.play(es.level.musicTrack);
        }
        if (es.level.moveAtLevelStart) {
          state.isMoving = true;
        }
        boss.current?.start();
        renderDifficultyUI();
        renderHeartsUI();
        renderScoreUI();
        renderLevelName();
        UI.showGfxCanvas();
        if (allowAchievements(state, replay.mode)) {
          checkAchievementForLevelReached({
            levelId: es.level.id,
            episode: state.episode,
            difficultyIndex: es.difficulty.index,
          });
        }
        startLogicLoop();
      });
  }
}
