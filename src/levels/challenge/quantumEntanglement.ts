
import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, TitleVariant } from "../../types";
import { WARP_ZONE_01 } from "../bonusLevels/warpZone01";

const name = 'quantum entanglement';

export const X_QUANTUM_ENTANGLEMENT: Level = {
  name,
  timeToClear: 1000 * 60 * 10,
  applesToClear: 80,
  disableAppleSpawn: true,
  numApplesStart: 0,
  applesModOverride: 1,
  extraHurtGraceTime: 21,
  snakeStartSizeOverride: 3,
  growthMod: 1,
  layout: ``,
  layoutV2: `YipTcGNjKSkpKSlmWElpTV9YLi1kWk1vWmlNS0taaWxkLj1fZikpKSkpKSljcFNYKlhiClA1M3xET1dOfHF1YW50dW0gZW50YW5nbGVtZW50azAwMDAwfDgwa1YzVjIxViM4M0VDRDNHMjFENGpHMkMyQTM4R0NCQ0RDREdEMkQ0RDRZNzM0NDZHNDk0NTVFWTQzRjQ3RzRFNjk3Q0dFMWo1MUdEQzk5MkVHRURDQjk2UFRUVFA0ISgnN0onWFgoWEk9TT0pITdSKkloaCd4UUFRQVFBUSAuSWlNSEwnWExITEhMJ01kSWktRy0jSCcnSQpYPUpBMScxQTMnM0E0JzRBbyBNLT1WMVEgakFSJyBTKCd4ZEhkSGRIZCdYZFQtMS0xLTFVSEhIVlB8WUc0MDNENTJHM1o9LV94eHh4VUhSYgpVVUgnYyE3J2RmKC1qSjdSaD09aS0takFBa3wzb0sgcCFLMGQBcG9ramloZmNiX1pZVlVUU1JRUE1LSklIRy4qKSgnIV8%25253D`,
  colors: getExtendedPalette(PALETTE.scienceLab),
  showTitle: true,
  musicTrack: MusicTrack.woorb,
  titleVariant: TitleVariant.GrayBlue,
  nextLevel: WARP_ZONE_01,
};
