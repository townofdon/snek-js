import {
  ALL_APPLES_BONUS,
  ALL_LOCKS_BONUS,
  COBRA_SCORE_MOD,
  DEFAULT_PAR_TIME,
  LEVEL_BONUS,
  LIVES_LEFT_BONUS,
  PERFECT_BONUS,
} from "@/constants";
import { Context } from "./context";
import { GameMode } from "@/types";

function getParTimeBonusMultiplier(ctx: Context) {
  const { es, stats } = ctx;
  const parTime = es.level.parTime || DEFAULT_PAR_TIME;
  const clearTime = Math.floor(stats.totalLevelTimeElapsed / 1000) * 1000;
  if (parTime <= 0) return 1;
  if (clearTime > parTime) return 1;
  // if (clearTime <= parTime - 30000) return 3;
  if (clearTime <= parTime - 20000) return 2.5;
  if (clearTime <= parTime - 10000) return 2;
  if (clearTime <= parTime) return 1.5;
  return 1;
}

export function getLevelClearBonus(ctx: Context) {
  const { es, state } = ctx;
  const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
  return (LEVEL_BONUS * es.difficulty.bonusMod * cobraMod || LEVEL_BONUS) * getParTimeBonusMultiplier(ctx);
}

export function getLivesLeftBonus(ctx: Context) {
  const { es, state } = ctx;
  const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
  return LIVES_LEFT_BONUS * es.difficulty.bonusMod * cobraMod || LIVES_LEFT_BONUS;
}

export function getAllApplesBonus(ctx: Context) {
  const { es, state } = ctx;
  const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
  return ALL_APPLES_BONUS * es.difficulty.bonusMod * cobraMod || ALL_APPLES_BONUS;
}

export function getAllLocksBonus(ctx: Context) {
  const { es, state } = ctx;
  const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
  return ALL_LOCKS_BONUS * es.difficulty.bonusMod * cobraMod || ALL_LOCKS_BONUS;
}

export function getPerfectBonus(ctx: Context) {
  const { es, state } = ctx;
  const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
  return PERFECT_BONUS * es.difficulty.bonusMod * cobraMod || PERFECT_BONUS;
}
