import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { TUTORIAL_LEVEL_10 } from "../tutorialLevel10";

const name = 'secret area 1-1';

export const SECRET_LEVEL_10: Level = {
  type: LevelType.Level,
  name,
  timeToClear: Infinity,
  applesToClear: Infinity,
  disableAppleSpawn: true,
  numApplesStart: 0,
  // extraHurtGraceTime: 10,
  // snakeStartSizeOverride: 150,
  growthMod: 0,
  layout: `
XXXXXX  XXXXXX  XXXXXX  XXXXXX
XAaaAAaaAAaaAAaaAAaaAAaaAAaaAX
XaXX==XX==XX==XX==XX==XX==XXaX
XaXX==XX==XX==XX==XX==XX==XXaX
XA== AaaAAaaAAaaAA==AAaaAA==AX
XA== A==  ==  == A==A == A==AX
 aXX=aXX==XX==XX=aXXa=XX=aXXa 
 aXX=aXX==XX==XX=aXXa=XX=aXXa 
XA== A==  ==  == A==A == A==AX
XA==AA==AAaaAAaaAA==A == A==AX
XaXXa=XXa=XX==XX==XXa=XX=aXXaX
XaXXa=XXa=XX==XX==XXa=XX=aXXaX
XA==A ==A ==O ==AAaaA == A==AX
XA==A ==A ==  ==  ==  == A==AX
 aXXa=XXa=XX==XX==XX==XX=aXXa 
 aXXa=XXa=XX==XX==XX==XX=aXXa 
XA==A ==A ==AAaaAA== AaaAA==AX
XA==A ==A ==A == A== A==  ==AX
XaXXa=XXa=XXa=XX=aXX=aXX==XXaX
XaXXa=XXa=XXa=XX=aXX=aXX==XXaX
XA==AA==A ==A == A== AaaAA==AX
XA== A==A ==A == A==  == A==AX
 aXX=aXXa=XXa=XX=aXX==XX=aXXa 
 aXX=aXXa=XXa=XX=aXX==XX=aXXa 
XA== A==A ==A == A==  == A==AX
XA== A==AAaaA == AaaAAaaAA==AX
XaXX=aXX==XX==XX==XX==XX==XXaX
XaXX=aXX==XX==XX==XX==XX==XXaX
XAaaAA==AAaaAAaaAAaaAAaaAAaaAX
XXXXXX  XXXXXX  XXXXXX  XXXXXX
  `,
  colors: getExtendedPalette(PALETTE.gravChamber),
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: false,
  portalExitConfig: {
    1: PortalExitMode.SameDirection,
    2: PortalExitMode.SameDirection,
    3: PortalExitMode.SameDirection,
    4: PortalExitMode.SameDirection,
    5: PortalExitMode.SameDirection,
    6: PortalExitMode.SameDirection,
    7: PortalExitMode.SameDirection,
    8: PortalExitMode.SameDirection,
    9: PortalExitMode.SameDirection,
    0: PortalExitMode.SameDirection,
  },
  musicTrack: MusicTrack.backrooms,
  globalLight: 0.2,
  nextLevel: TUTORIAL_LEVEL_10,
};
