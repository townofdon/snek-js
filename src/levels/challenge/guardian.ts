import { MusicTrack } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";
import { X_KINGS_HALL } from "./kingsHall";

const name = 'guardian';

export const X_GUARDIAN = challengeLevel({
  id: 'X406',
  name,
  parTime: toTime({ minutes: 1, seconds: 34 }),
  layoutV2: `ek9oVlZzTihFU04oeVYhcSFsa1hGRkZrIWxLb1dxVnNOKEVTTihMQWpYKlZWWGhYaFhPegp8NDI2fFJJR0hUfGd1YXJkaWFuVTIwMDB%252BNH4zfDBVMHAwcCMxNUMyQ0JNMTE5REE0bTJjNjM1Mk0zMjUxNzB0bTE5MTkzOHRNMmMzODRhTTIxMjk0M01lMDY1NGZNYmY2NjcwTWZmYWY5OVVfX19VMCFYS3hXKCBZTk4gKU5OUCk9PT0qLCcuWFhYU1lZWVlZKVlZWVlGS2R2KykpKSkpKT12SioqKksKWE0tI04gIE9LWngqd3dBKnFYUCBZIFFsbGxsU0V5c3AxViEuWHhXLlAuICkgLlBZLS1xeF8tMS0xLTFoS3hRWFh4a0t4WCoqKCoqLmwuLm1NMEQwRDFDTXBVfHFaeHhzWEsqWHRNMTMxMzJBdisrd0FBKloqQXlMQUFYKnoKUWx%252BMHwBfnp5d3Z0c3FwbWxraF9aWVdWVVNRUE9OTUtGRS4qKSghXw%253D%253D`,
  musicTrack: MusicTrack.ascension,
  nextLevel: X_KINGS_HALL,
});


