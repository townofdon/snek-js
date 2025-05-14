import { MusicTrack } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

const name = 'too simple';

export const X_TOO_SIMPLE= challengeLevel({
  id: 'X413',
  name,
  parTime: toTime({ minutes: 1, seconds: 12 }),
  layoutV2: `U0laSFpjSSlIKWNJRUhFY0QhRydfX2tEbkdEbk5Bbk5HTmdPUUFRRCFnKEQoZ1FsUUQoZyFEKEcnKCcoJygnX19fX19rZkVIRVhmKUgpWGZaSFpYUwp8NTczfFVQfHRvb3NpbXBsZTV8MzAwMDAwSkpKSjAwVjBWI2JiNTI1MkI2OTQ1NmRSV1cxRjI2MzNSMjcyRjNGQjFGMjYzM1lZQmQ2Mzg2ZEJlNTRkODBCYTE0NDYzSk1NTXw4IVhULVgnQSFET25RIFEpLUtLai0qUVFRLi0tLUItI0RoT0VULi1ULWdrSExMTEkKZGRWMWogTS0xLTEtMU5HaChrQVFYWFJCMTExNTFDQlMKKioqKipULSBWSnxXNGI4Mjk0QllCODA2OGExWi4uLl8hJ2NILlhmSS5IZ0dBaApYaksga08hbk8oAW5ramhnZmNfWllXVlRTUlFPTk1LSklIR0VEQi4qKSgnIV8%253D`,
  musicTrack: MusicTrack.factorio,
});
