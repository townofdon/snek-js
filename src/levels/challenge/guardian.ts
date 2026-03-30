import { MusicTrack, ItemDropType } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

const name = 'guardian';

export const X_GUARDIAN = challengeLevel({
  id: 'X406',
  name,
  parTime: toTime({ minutes: 1, seconds: 34 }),
  // layoutV2: `ek9oVlZzTihFU04oeVYhcSFsa1hGRkZrIWxLb1dxVnNOKEVTTihMQWpYKlZWWGhYaFhPegp8NDI2fFJJR0hUfGd1YXJkaWFuVTIwMDB%252BNH4zfDBVMHAwcCMxNUMyQ0JNMTE5REE0bTJjNjM1Mk0zMjUxNzB0bTE5MTkzOHRNMmMzODRhTTIxMjk0M01lMDY1NGZNYmY2NjcwTWZmYWY5OVVfX19VMCFYS3hXKCBZTk4gKU5OUCk9PT0qLCcuWFhYU1lZWVlZKVlZWVlGS2R2KykpKSkpKT12SioqKksKWE0tI04gIE9LWngqd3dBKnFYUCBZIFFsbGxsU0V5c3AxViEuWHhXLlAuICkgLlBZLS1xeF8tMS0xLTFoS3hRWFh4a0t4WCoqKCoqLmwuLm1NMEQwRDFDTXBVfHFaeHhzWEsqWHRNMTMxMzJBdisrd0FBKloqQXlMQUFYKnoKUWx%252BMHwBfnp5d3Z0c3FwbWxraF9aWVdWVVNRUE9OTUtGRS4qKSghXw%253D%253D`,
  layoutV2: 'ClFtUGxRWFVGKVh4T0VFWk9aWEZjKXFsWUZtV0tLS1dGbU1vWUZjKXhPRUVaT0xBalguWEYpVWxRWFhxbFFYWHFQClFtCnw0MjZ8UklHSFR8Z3VhcmRpYW5WMjAwMHM0czN8MFYwdDB0IzE1QzJDQk4xMTlEQTRwMmM2MzUyTjMyNTE3MHZwMTkxOTM4dk4yYzM4NGFOMjEyOTQzTmUwNjU0Zk5iZjY2NzBOZmZhZjk5Vl9fX1ZzMCE9PT0oIGsgKVhYWCogIC4sJ0VaWE0uWGtra2trIWtra2tGbCkoKVMpKEtNZHkrISEhISEhPXlKLi4uTQpYTi0jT1hNLlgqd1BsaC5oQS5oLnp6cVFtbW1tUyAhIFVYcWwpKH5TfigpWHF0MVdsYy4udy4uYilZfigpUykoenpxWkxBQVguXy0xLTEtMWh6eC5BQWstLWxNeG0pKXBOMEQwRDFDTnF4WHMwfHRWfHZOMTMxMzJBdygqKiEqKih5Kyt6eHh%252BWGJYAX56eXd2dHNxcG1sa2hfWllXVlVTUVBPTk1LRkUuKikoIV8%253D',
  musicTrack: MusicTrack.ascension,
  pickupDrops: {
    [ItemDropType.Invincibility]: false,
    [ItemDropType.Mine]: false,
  },
});


