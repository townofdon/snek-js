import { MusicTrack } from "../../types";
import { challengeLevel } from "./_challengeLevel";
import { X_SKILL_CHECK } from "./skillCheck";

const name = 'quantum\nentanglement';

export const X_QUANTUM_ENTANGLEMENT = challengeLevel({
  name,
  layoutV2: `YipTcGNjKSkpKSlmWElpTV9YLi1kWk1vWmlNS0taaWxkLj1fZikpKSkpKSljcFNYKlhiClA1M3xET1dOfHF1YW50dW0gZW50YW5nbGVtZW50azAwMDAwfDgwa1YzVjIxViM4M0VDRDNHMjFENGpHMkMyQTM4R0NCQ0RDREdEMkQ0RDRZNzM0NDZHNDk0NTVFWTQzRjQ3RzRFNjk3Q0dFMWo1MUdEQzk5MkVHRURDQjk2UFRUVFA0ISgnN0onWFgoWEk9TT0pITdSKkloaCd4UUFRQVFBUSAuSWlNSEwnWExITEhMJ01kSWktRy0jSCcnSQpYPUpBMScxQTMnM0E0JzRBbyBNLT1WMVEgakFSJyBTKCd4ZEhkSGRIZCdYZFQtMS0xLTFVSEhIVlB8WUc0MDNENTJHM1o9LV94eHh4VUhSYgpVVUgnYyE3J2RmKC1qSjdSaD09aS0takFBa3wzb0sgcCFLMGQBcG9ramloZmNiX1pZVlVUU1JRUE1LSklIRy4qKSgnIV8%253D`,
  musicTrack: MusicTrack.woorb,
  nextLevel: X_SKILL_CHECK,
});
