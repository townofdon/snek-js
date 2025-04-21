import { MusicTrack } from "../../types";
import { challengeLevel } from "./_challengeLevel";
import { X_FORTITUDE } from "./fortitude";

const name = 'catacombs';

export const X_CATACOMBS = challengeLevel({
  id: 'X404',
  name,
  layoutV2: `T2xYKSlaVXBaVXBMTCoqUVlqalNRWSdYRiBqUyoqTk5xKikpcSopKSpNKCFwKSkKbFhPfDM3MnxSSUdIVHxjYXRhY29tYnNQOTA5NjVQMjR8MmhoM3wwUGgwLjE4fCNCQTRDNzZKODQzMzUyZ0U3NkQ4M0pFMjUwNkFrZzMwMzQzNmtKRTM5OTdCSkREODQ2MUpmMmZkZmZKNmI5MmFmSjk2YmZjY1BXV1dQNiEgViAnZVYobm4pUWpqJ1MqTSEhcEZYIEotI0tleHhleHhMUWlqaVlTTVohISFOUWonX19WJ1NPCmVLS0tlZQpQfDFRCkZTJ1hGbCgoKFY9PVctMS0xLTFZWEY9Wgp4IWVYWGdKMUQyMDIwSmgwfGllPSBqJydrSjI2MkEyQmxYVSgobiAgcCF4cU0hKHABcXBubGtqaWhnZVpZV1ZVU1FQT05NTEtKRiopKCchXw%253D%253D`,
  musicTrack: MusicTrack.lostcolony,
  nextLevel: X_FORTITUDE,
});

