import { VectorList } from "@/collections/vectorList";
import { LUNGE_STEPS, SPEED_LIMIT_ULTRA } from "@/constants";
import { EngineState, GameState, HeldItems, LoopState, PlayerState, Replay, Sound, Stats, ThreatType } from "@/types";
import { getLevelProgress, isBreakableBarrier } from "@/utils";

interface EngineLogicArgs {
  state: GameState,
  es: EngineState,
  player: PlayerState,
  loopState: LoopState,
  segments: VectorList,
  replay: Replay,
  heldItems: HeldItems,
  stats: Stats,
}

export function engineLogic({
  state,
  es,
  player,
  loopState,
  segments,
  replay,
  heldItems,
  stats,
}: EngineLogicArgs) {

  const swole = () => getLevelProgress(stats, es.level, es.difficulty) > 0.45 || segments.length >= 50;

  const lunging = () => state.lungeStepsRemaining > 0;

  const lungedRecently = () => state.lungeStepsRemaining > 0 || state.timeSinceLungeStart < SPEED_LIMIT_ULTRA * (LUNGE_STEPS + 1);

  const invincible = () => state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;

  const canBreakWalls = () => (lunging() && swole()) || heldItems.armor > 0;

  const canBreakWallsWithoutDamage = () => canBreakWalls() && (
    invincible() || (lunging() && heldItems.armor > 0)
  );

  const wallBreakableAt = (coord: number) => !es.passablesMap[coord] && isBreakableBarrier(es.barriersMap[coord])

  const canExplodeBarrelAt = (coord: number) => lunging() && es.threatsMap[coord] === ThreatType.ExplodableBarrel;

  const logic = {
    swole,
    lunging,
    lungedRecently,
    invincible,
    canBreakWalls,
    canBreakWallsWithoutDamage,
    wallBreakableAt,
    canExplodeBarrelAt,
  };
  return logic;
};
