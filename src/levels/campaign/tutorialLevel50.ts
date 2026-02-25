import { MusicTrack } from "../../types";
import { toTime } from "../../utils";

import { challengeLevel } from "../challenge/_challengeLevel";

const name = 'minefield';

export const TUTORIAL_LEVEL_50 = challengeLevel({
  id: 'C150',
  name,
  parTime: toTime({ minutes: 0, seconds: 15 }),
  layoutV2: `dndoaGhoaHdoTyEhVU56dE1VfnpfTXR%252BQSEhKSkpKUF1WFAnIVhBTkFYTD1RY0EpLVFxdSEhdSEhTlBVJ19ZUFVQWVVQJ1VWCmInXycpVk9zdF9fQXJPc1UhWGopKHNqKShqamp4KWhoT2pTWGohdgp8NDI3fFJJR0hUfG1pbmVmaWVsZHwzMDAwMGsyay1aWjJrWjd8MC42fCM4M0VDRDNKMjFENF9nMzM5NUJKMkU0QTc2b2c3MkMzRm9KNDA2RThFSjQ2Nzc5QkpEN0RGRUFKNUY4MkFCSkFGQzFENXxXV1daNCEpKXNNIChPcVNYcWJYSi0jS3BYcE0nIE5YeU8KIVAnJ1EnTWFhVWFhYWFhLVNYcSlxVSoqVnoqc2RyVzEtMS0xLVlNVXpQcXlaMXxfQUFhLS1iKVhjPUFOZ0oxNjE5MjVKMmgoIWp4eGswfG9KMUYyMzMzcCsrcWRkciAqKXMpYnRVTV91TkEhdk9LKUshd08pUyFieQpYelBQfi1NYWMBfnp5d3Z1dHNycXBva2poZ2NiYV9aWVdWVVNRUE9OTUtKKSgnIV8%253D`,
  musicTrack: MusicTrack.aqueduct,
});
