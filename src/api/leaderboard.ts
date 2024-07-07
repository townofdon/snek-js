import { LEADERBOARD_API_HOST } from "../constants";
import { Api, ApiOptions } from "./utils/apiUtils";

export interface HighScoreEntry {
  id: string,
  name: string,
  score: number,
}

export const getLeaderboard = (): Promise<HighScoreEntry[]> => {
  const url = `${LEADERBOARD_API_HOST}/leaderboard`;
  return Api.get(url);
}

interface GetTokenResponse {
  csrfToken: string;
}

export const getToken = async (): Promise<string> => {
  const url = `${LEADERBOARD_API_HOST}/csrf-token`;
  const res: GetTokenResponse = await Api.get(url);
  if (res.csrfToken) {
    return res.csrfToken;
  }
}

export const postLeaderboardResult = (name: string, score: number, options: ApiOptions): Promise<void> => {
  const url = `${LEADERBOARD_API_HOST}/leaderboard`;
  const body = { name, score };
  return Api.post(url, body, options);
}
