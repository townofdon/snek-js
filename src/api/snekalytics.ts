import { v4 as uuid } from 'uuid';

import { IS_DEV, MAP_API_HOST } from "../constants";
import { Api } from "./utils/apiUtils";
import { identityStore } from '../stores/IdentityStore';

export const recordSnekalyticsEvent = (event: {
  eventType: String,
  difficulty: String,
  levelName: String,
  levelProgress: Number,
  levelTimeProgress: Number,
  score: Number,
  isCobra: Boolean,
}): Promise<void> => {
  const url = `${MAP_API_HOST}/snekalytics`;
  const isDev = IS_DEV;
  const origin = window.location.origin;
  const sessionId = identityStore.getId();
  const body = { ...event, origin, sessionId, isDev };
  return Api.post(url, body).catch(err => { console.error(err); });
}
