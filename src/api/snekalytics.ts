import { COMMIT_HASH, IS_DEV, MAP_API_HOST, VERSION } from "../constants";
import { Api } from "./utils/apiUtils";
import { identityStore } from '../stores/IdentityStore';

export const recordSnekalyticsEvent = (event: {
  eventType: string,
  playthroughId: string,
  difficulty: string,
  levelName: string,
  levelProgress: Number,
  levelTimeProgress: Number,
  score: Number,
  isCobra: Boolean,
}): Promise<void> => {
  const url = `${MAP_API_HOST}/snekalytics`;
  const isDev = IS_DEV;
  const origin = window.location.origin;
  const sessionId = identityStore.getId();
  const version = VERSION;
  const commitHash = COMMIT_HASH
  const body = { ...event, origin, sessionId, version, commitHash, isDev };
  return Api.post(url, body).catch(err => { console.error(err); });
}
