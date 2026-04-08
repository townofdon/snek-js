import { COMMIT_HASH, IS_DEV, IS_LOCALHOST, MAP_API_HOST, VERSION } from "../constants";
import { Api } from "./utils/apiUtils";
import { identityStore } from '../stores/IdentityStore';
import { SNEKALYTICS_EVENT_TYPE } from "@/types";

export const recordSnekalyticsEvent = (event: {
  eventType: SNEKALYTICS_EVENT_TYPE,
  playthroughId: string,
  difficulty: string,
  levelName: string,
  levelProgress: Number,
  levelTimeProgress: Number,
  score: Number,
  isCobra: Boolean,
}): Promise<void> => {
  if (IS_LOCALHOST) return;
  const url = `${MAP_API_HOST}/snekalytics`;
  const isDev = IS_DEV;
  const origin = window.location.origin;
  const sessionId = identityStore.getId();
  const version = VERSION;
  const commit = COMMIT_HASH
  const body = { ...event, origin, sessionId, version, commit, isDev };
  return Api.post(url, body).catch(err => { console.error(err); });
}
