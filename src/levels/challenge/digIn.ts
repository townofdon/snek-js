import { MusicTrack } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

export const X_DIGIN = challengeLevel({
  id: 'X419',
  name: 'dig in',
  parTime: toTime({ minutes: 1, seconds: 8 }),
  layoutV2: `dGtQdk4gT00hdiogdlEgSnh4KXdwIS5KeGl4KU1%252BKiEuKXh4KU1%252BKlkpUXlKSilVXylRUVFvdz0tKS1PTylYUVFRb3d%252BIE9PKVhRaEEgWVgqeVFoQUFZWCogZGRReX5NQSBZWG1%252BbU4pKE8pWCgoPSlOck4pKE8pWChPb3JOKSgpKCgoPU9vcnBXZFkqV2whUSEheHVOIVdkWVYhIXh4TiFkZC4pUHdwKS4pUHFxdyBaQVogQSkqKVZocFBRaCF2KiEudlBYayFQTiB2UFh0Cnw1OGVSSUdIVHxkaWcgaW5mMjAwMGU1ZWVlNXo2eiM2ODlkYjNTNDg2NThjczQ3MzEzNVM2YzQyNGFTMjYyQTJCczMwMzQzNlMyNjJBMkJTOTc4NzhGUzYyNTY1Q1NGRkY2RjFTMEEwRTE0U0U5RUZGRmZqampmOVAgKE49KVhYKlYhUCghLlYgTQpYTj09TykpKVAhVi0tUy0jVU09LSlRUVFRKFFWIFFXIS4pfgpLIVksJ1pBKSAtT09YLilQd2UwfHoxaCEhIXdqLTEtMS0xa00hdiBOIVAobVYpUCghIS4pfk1vLT1wIWRkKnFYVSlRUSlRPXIrS01zUzFEMjAyMFN0Ck9PT09PdkxMd1hNeSApemZ8fiEpAX56eXd2dHNycXBvbWtqaGZlWllXVlVTUVBPTk0uKikoIV8%253D`,
  musicTrack: MusicTrack.reconstitute,
});
