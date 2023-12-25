import { LEADERBOARD_HOST } from "../constants";
import { Api } from "./utils/apiUtils";

export interface HighScoreEntry {
  id: string,
  name: string,
  score: number,
}

export const getLeaderboard = (): Promise<HighScoreEntry[]> => {
  const url = `${LEADERBOARD_HOST}/leaderboard`;
  return Api.get(url);
}

export const getToken = (): Promise<string> => {
  const url = `${LEADERBOARD_HOST}/csrf-token`;
  return Api.get(url);
}

export const addLeaderboardResult = (name: string, score: number): Promise<void> => {
  const url = `${LEADERBOARD_HOST}/leaderboard`;
  const body = { name, score };
  return Api.post(url, body);
}
