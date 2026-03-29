import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { toTime } from "../../utils";
import { LEVEL_WIN_GAME } from "../winGame";

const name = 'endurance';

export const VARIANT_LEVEL_99: Level = {
  id: 'C299',
  name,
  timeToClear: 1000 * 60 * 10,
  parTime: toTime({ minutes: 3, seconds: 45 }),
  applesToClear: 295,
  numApplesStart: 20,
  growthMod: 0.18,
  extraHurtGraceTime: 20,
  layout: `
XXXXXXXXXXXXXXLLXXXXXXXXXXXXXX
X     --~~~~XXddXX~~~~__ JJJKX
X     --      __      -- JKkJX
X     --    ~KKKK~    -- JKKJX
X     --     KXXK     -- JJJJX
X     --     KXXK     --     X
X     --     KKKK     --     X
X-----LL      --      LL-----X
X-----LL      --      LL-----X
X~            --            ~X
X~            --            ~X
X~            --            ~X
XX          XXKKXX          XX
XX KKKK     X_dd_X     KKKK XX
Ld_KXXK-----KdladK-----KXXK_dL
Ld_KXXK-----KdaadK-----KXXK_dL
XX KKKK     X_dd_X     KKKK XX
XX          XXKKXX          XX
X~            --            ~X
X~        O   --            ~X
X~            --            ~X
X-----LL      --      LL-----X
X-----LL      --      LL-----X
X     --     KKKK     --     X
X     --     KXXK     --     X
X     --     KXXK     --     X
XxXX  --    ~KKKK~    --     X
XxjX  --      __      --     X
XXxx  __~~~~XXddXX~~~~__     X
XXXXXXXXXXXXXXLLXXXXXXXXXXXXXX
  `,
  // layoutV2: `ClpQTExaWE1tIVZicEpKS01tfnBLa0pNbXZwS0tKemhWcEpKSnopTSlZKU5OKCgoaU1YVVAKeWxXeSc6V1BVWGkoKChOTk0pWSl6KXopTXhQdiFtTXhqWH4hbU1YeHghX19iIW1NWlhMTFpQCnw1OGZSSUdIVHxlbmR1cmFuY2V8NjAwMDBmMjk1fDJmZjN8MC4xOHwyZjF8IzY4QjJBOVE0ODhDODR0RTc2RDgzUUUyNTA2QXd0MzAzNDM2d1E5Nzg3OEZRNjI1NjVDUUZGRjZGMVEwQTBFMTRRRTlFRkZGfG9vbzF8MTghICAoTU9TU1NWU1NTTyloVmhNWApYTk1xTExzVnNMTHFPLCdQWFhRLSNzIVUgWWhYX2RkX1hoWSBWLS1XJzpkS3FnX2RMCllLS0tLWlBQUFBQUGJPT09PUGRkUE9PT09fX2YwfGdLUEtoUyBpTVhTc1BLS1BTc1htKioqbzEtMS0xLXAgSnFWVi1zUyF0UTFEMjAyMFF2IVZTT1lPU1Z3UTI2MkEyQnlMZF9ncUtkek0pZ34hVnNfX3NWAX56eXd2dHNxcG9taWhnZmJaWVdWVVNRUE9OTSkoIV8%253D`,
  // layoutV2: `ClpQTExaWE1tIVZicEpKS01tfnBLa0pNbXZwS0tKemhWcEpKSnopTSlZKU5OKCgoaU1YVVAKeWxXeSc6V1BVWGkoKChOTk0pWSl6KXopTXhQdiFtTXhqWH4hbU1YeHghX19iIW1NWlhMTFpQCnw1OGZSSUdIVHxlbmR1cmFuY2V8NjAwMDBmMjk1fDJmZjN8MC4xOHwyZjF8IzY4QjJBOVE0ODhDODR0RTc2RDgzUUUyNTA2QXd0MzAzNDM2d1E5Nzg3OEZRNjI1NjVDUUZGRjZGMVEwQTBFMTRRRTlFRkZGfG9vbzF8MTh8MyEgIChNT1NTU1ZTU1NPKWhWaE1YClhOTXFMTHNWc0xMcU8sJ1BYWFEtI3MhVSBZaFhfZGRfWGhZIFYtLVcnOmRLcWdfZEwKWUtLS0taUFBQUFBQYk9PT09QZGRQT09PT19fZjB8Z0tQS2hTIGlNWFNzUEtLUFNzWG0qKipvMS0xLTEtcCBKcVZWLXNTIXRRMUQyMDIwUXYhVlNPWU9TVndRMjYyQTJCeUxkX2dxS2R6TSlnfiFWc19fc1YBfnp5d3Z0c3Fwb21paGdmYlpZV1ZVU1FQT05NKSghXw%253D%253D`,
  layoutV2: 'WU9vdGZzSkpLd29%252Bc0trSndvdFVOWk5VV3NLS0pibVdzSkpKYil3KVopWE1NKCgoCmdQcWxoCnEnOmhQZygoKE1NTylaKWIpYil3eFN0VU5aTlVXIW93eGpYfiFvd1h4eCFfX2Yhb1hZCnw1OGlSSUdIVHxlbmR1cmFuY2V8NjAwMDBpMjk1fDJpaTN8MC4xOHwyaTF8IzY4QjJBOVE0ODhDODR2RTc2RDgzUUUyNTA2QXp2MzAzNDM2elE5Nzg3OEZRNjI1NjVDUUZGRjZGMVEwQTBFMTRRRTlFRkZGfHBwcDF8MTh8MyEgIChPTlVVVVdVVVVOWCltV21NT3lMTFV0VSFMTHlYTiwnTwpYUApWQiBabUJfZGRfQm1aIEJWClEtI1NYWFUhdC0tWU9TU1NTU1hWVkxMVlZTU1NTU1NaS0tLS2J3KUtTS2ZOTk5OQkJkZEJCTk5OTl9fZ1ZCVVUhQkJLS0JCVVUhQlZoJzpkS3lLU0tfZExpMHxtVSBvKioqcDEtMS0xLXFMZF9LU0t5S2RzIEp0IVd2UTFEMjAyMFF3WE95V1ctelEyNjJBMkJ%252BdFUhX19VdAF%252Benl3dnRzcXBvbWloZ2ZiWllXVVNRUE9OTSkoIV8%253D',
  colors: getExtendedPalette(PALETTE.darkStar),
  showTitle: true,
  extraLoseMessages: [
    ["The bold. The courageous. The Snek."],
    ["Too much for you, eh?"],
    ["Don't quit now, this is the final level!"],
    ["What? Not enough treats for ya?"],
    ["How many is this? I've lost count."],
    ["Yours will be an epic tale told for centuries."],
    ["This is nail-biting drama at its finest."],
    ["Tales of your deeds shall resound across the lands."],
    ["This reminds us that life is fragile.<br/><br/>And also not to run into things."],
    ["A thin line exists<br/>between the stout-hearted<br/>and the foolhardy."],
    ["Way to snatch defeat from the jaws of victory..."],
    ["Aw snap, just when it was beginning to get interesting..."],
    ["That move from 10 seconds ago is really what did you in..."],
    ["Are you starting to question your life decisions?"],
    ["What are you after, bragging rights?"],
    ["Ashes to ashes.<br/><br/>dust to dust.<br/><br/>snek to wall."],
  ],
  disableNormalLoseMessages: true,
  showQuoteOnLevelWin: false,
  titleVariant: TitleVariant.Red,
  musicTrack: MusicTrack.slyguy,
  nextLevel: LEVEL_WIN_GAME,
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: true,
  },
  pickupDropsByFrame: {
    50: { likelihood: 0.8, type: ItemDropType.Invincibility },
    75: { likelihood: 0.05, type: ItemDropType.Invincibility },
    100: { likelihood: 0.8, type: ItemDropType.Invincibility },
    125: { likelihood: 0.05, type: ItemDropType.Invincibility },
    150: { likelihood: 0.8, type: ItemDropType.Invincibility },
    175: { likelihood: 0.05, type: ItemDropType.Invincibility },
    200: { likelihood: 0.8, type: ItemDropType.Invincibility },
    225: { likelihood: 0.05, type: ItemDropType.Invincibility },
    250: { likelihood: 0.8, type: ItemDropType.Invincibility },
    275: { likelihood: 0.05, type: ItemDropType.Invincibility },
    300: { likelihood: 0.8, type: ItemDropType.Invincibility },
    325: { likelihood: 0.05, type: ItemDropType.Invincibility },
    350: { likelihood: 0.8, type: ItemDropType.Invincibility },
    375: { likelihood: 0.05, type: ItemDropType.Invincibility },
    400: { likelihood: 0.8, type: ItemDropType.Invincibility },
    425: { likelihood: 0.05, type: ItemDropType.Invincibility },
    450: { likelihood: 0.8, type: ItemDropType.Invincibility },
    460: { likelihood: 1, type: ItemDropType.Invincibility },
  },
}; 
