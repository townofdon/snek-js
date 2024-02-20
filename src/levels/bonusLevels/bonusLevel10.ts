import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { TUTORIAL_LEVEL_10 } from "../tutorialLevel10";

const name = 'secret area 1-1';

export const BONUS_LEVEL_10: Level = {
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
XXXXXXXX  XXXXXXXXXX  XXXXXXXX
XAaaAAaaAAaaAAaaAAaaAAaaAAaaAX
XaXX==XX==XX==XX==XX==XX==XXaX
XaXX==XX==XX==XX==XX==XX==XXaX
XA== AaaAAaaAAaaAA==AAaaAA==AX
XA== A==  ==  == A==A == A==AX
XaXX=aXX==XX==XX=aXXa=XX=aXXaX
XaXX=aXX==XX==XX=aXXa=XX=aXXaX
 A== A==  ==  == A==A == A==A 
 A==AA== AaaAAaaAA==A == A==A 
XaXXa=XXaaXX==XX==XXa=XX=aXXaX
XaXXa=XXa=XX==XX==XXa=XX=aXXaX
XA==A ==A ==O ==AAaaA ==AA==AX
XA==A ==A ==  ==  ==  ==A ==AX
XaXXa=XXa=XX==XX==XX==XXa=XXaX
XaXXa=XXa=XX==XX==XX==XXa=XXaX
XA==A ==A ==AAaaAA== AaaA ==AX
XA==A ==A ==A == A== A==  ==AX
XaXXa=XXa=XXa=XX=aXX=aXX==XXaX
XaXXa=XXa=XXa=XX=aXX=aXX==XXaX
 A==AA==A ==A == A== AaaA ==A 
 A== A==A ==A == A==  ==A ==A 
XaXX=aXXa=XXa=XX=aXX==XXaaXXaX
XaXX=aXXa=XXa=XXaaXX==XX=aXXaX
XA== A==A ==A ==A ==  == A==AX
XA== A==AAaaA ==AAaaAAaaAA==AX
XaXX=aXX==XX==XX==XX==XX==XXaX
XaXX=aXX==XX==XX==XX==XX==XXaX
XAaaAA==AAaaAAaaAAaaAAaaAAaaAX
XXXXXXXX  XXXXXXXXXX  XXXXXXXX
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
