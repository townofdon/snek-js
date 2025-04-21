import { MusicTrack } from "../../types";
import { challengeLevel } from "./_challengeLevel";
import { X_STONEMAZE } from "./stonemaze";

const name = 'skill check';

export const X_SKILL_CHECK = challengeLevel({
  id: 'X412',
  name,
  layoutV2: `ClpaS09YIVhmZnYhdCkpYiFObm5uIVFkU1hkU29MU1hkYiFRZGJubm4hdCkpYiEgZmYqWCFYT1pacFgqWihacAp8NjY3fFJJR0hUfHNraWxsY2hlY2t8MTUwMDBhMTBhamFqMXxhMC40aiMxNUMyQ0JNMTE5REE0ZzIzNzU4TTJFNEE3Nm1nNzJDM0ZtTTRDODJBOU0zRjZDOERNRkZGNkYxTTBBMEUxNE1FOUVGRkZ8WVlZMXw2IUpVVihWVUonUV9VdF8odF9VUV8oVz0pUD1xcVUtKHFxcVgwKnBQViAgdXBwTS0jTiB2TypLIFdWKFZXdSpQClhRIFhTUHJyclUtLVZKIFc9PVkxLTEtMS1aS0tLX1ggYTB8YlAgZipYJ1hnTTE2MTkyNU0yajN8bU0xRjIzMzNuJ05wWFhxVVVyKCgodFFYdSBLdiogAXZ1dHJxcG5tamdmYmFfWllXVlVTUVBPTk1LSiopKCchXw%253D%253D`,
  musicTrack: MusicTrack.observer,
  nextLevel: X_STONEMAZE,
});
