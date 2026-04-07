import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../../types";
import { toTime } from "../../utils";

const name = 'computer room'

export const LEVEL_18: Level = {
  id: 'C18',
  name,
  timeToClear: 1000 * 60 * 3.0,
  parTime: toTime({ minutes: 1, seconds: 20 }),
  applesToClear: 60,
  numApplesStart: 10,
  growthMod: 0.15,
  extraHurtGraceTime: 25,
  snakeStartSizeOverride: 5,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXX        X5X__k_X6X        X
XXX        X_X_XX_X_X        X
XXX       =X_X_XX_X_X=       X
XXX   === =X_X_XX_X_X= ===   X
XXX   dd=-=X_X_XX_X_X=-=dd   X
X8X   dd=-=ddX1XX3Xdd=-=dd   X
X_X   === =ddXXXXXXdd= ===   X
X_X       ===  --  ===       X
X_X            --            X
XxX            --            X
XxX=       ~~X~__~X~~       =X
XxX==      ~XXLLLLXX~      ==X
XxXXXX     XXXLLLLXXX     XXLX
XdJKLd-----_LLaaaaLL_-----dKlX
XdJKLd-----_LLaaaaLL_-----dK_X
XXXXXX     XXXLLLLXXX     XXLX
X8X==      ~XXLLLLXX~      ==X
X_X=       ~~X~__~X~~       =X
X_X            --            X
X_X    O       --            X
XxX       ===  --  ===       X
XxX   === =JJXXXXXXJJ= ===   X
dxX   dd=-=JJX5XX6XJJ=-=dd   X
dxX   dd=-=X_X_XX_X_X=-=dd   X
XXX   === =X_X_XX_X_X= ===   X
XXX       =X_X_XX_X_X=       X
XXX        X_X_XX_X_X        X
XXX        X1X_j__X3X        X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  layoutV2: 'CmdnZ2dOTlgqTlEpWDVYX19rfjZYUSloTVcqTiEoTXMhblZWWVY4ViFkZFBkZEMxVlYzQ2RkUGRkIWlYfiEod2RkZ2RkPXMhKn5XKCktLSkoVypfYXhheGZ4Wm5WeGJVbFVfaVZWYmlYOFoqX2ZfYV9heFhXKCktLSkoVyp4WCEod0pKZ0pKPXMhbmR4ViFkZFBKSkM1VlY2Q0pKUGRkIWlkeFlOWCEoTXMhKk5RTVdoKVgxWF9qX34zWFEpKmdnZ2dOTm58NjA3fFJJR0hUfGNvbXB1dGVyIHJvb218MTgwMDBxNnExcXE1fDAuMTV8MjV8MXwjRjA5MTU2U0VENzkiQ0JDRENEU0QyRDRENFMwQzI3IjEwMzQ0MlMwQzI3MzFTMkE5RDhGUzJGQjFBMlM5RUJEQkRTNkQ5QzlDU0QxREJEOXx6enpxMTl8MCEpc3k9KSAgKm5YTXdYfl92dn5%252BPU5YWE8sJ1A9LT1RISFTLSNVaVZkSktMZC0tLS0tX0xMQUFBQUxMXy0tLS0tZEtXUSBZViFkZFBWX0NfVlZfQ19WUGRkIWlaWHlRT05MTExMTk9ReWFYUVEtLVFRKmJWVlZWISlDVlZMTExMVlZDISlWVkxmWD1XT09YT19fT1hPT1c9KmdOTk5oKk5RKVh%252BX2Njfn5RKSpOUWlWCm5YCnEwfHMgKHcgPXk9PXowLTAtMC1%252BX1giMzFTMDUxMDE0UwEifnp5d3NxbmloZ2ZiYVpZV1VTUVBPTk0qKSghXw%253D%253D',
  // layoutV2: 'ClFRUVFYKnpTKVg1WF9ra19YNlhTKWZNWSpuWCEoTXchaFZWWlY4ViFkZFBkZEMxVlYzQ2RkUGRkIWlYX1ghKH5kZHptbXpkZD13ISpfWFkoKS0tKShZKl9heGF4Z3hYYlNPbXFMTExMbW1PU2JoVnhWVlZWISlydG1MTExMeXRyISlWVkxXV2lWVlZWVlYhKXJ0eUxMTExldHIhKVZWTGlYOFhiU09tbUxMTExxbU9TYipfZ19hX2F4WFkoKS0tKShZaE54WCEofkpKem1tekpKPXchaGR4ViFkZFBKSkM1VlY2Q0pKUGRkIWlkeFpOeiEoTXchKnpTTVlmKVgxWF9qal9YM1hTKSpRUVFRaHw2MDd8UklHSFR8Y29tcHV0ZXIgcm9vbXwxODAwMHM2czFzczV8MC4xNXwyNXwxfCNGMDkxNTZVRUQ3OSJDQkNEQ0RVRDJENEQ0VTBDMjciMTAzNDQyVTBDMjczMVUyQTlEOEZVMkZCMUEyVTlFQkRCRFU2RDlDOUNVRDFEQkQ5fDAtMC0wLTAtMC0wLTAtMC0wLXMxOXwwISl3Yj0pICAqaFhNflhfWF92dl9YX1g9TywnUD0tPVF6enpYUyEhVS0jV2lWZEpLTGQtLS0tLV9MTEFBQUFMTF8tLS0tLWRLbFlTIFpWIWRkUFZfQ19WVl9DX1ZQZGQhaWFYU1MtLVNTKmI9PWYqelMpWF9YX2NjX1hfWFMpKnpTZ1g9WU9Pck9fX09yT09ZPSpoWAppVgpzMHx3ICh6WFh%252BID0iMzFVMDUxMDE0VQEifnp3c2loZ2ZiYVpZV1VTUVBPTSopKCFf',
  colors: getExtendedPalette({
    ...PALETTE.panopticon,
    apple: PALETTE.violetSunset.apple,
    appleStroke: PALETTE.violetSunset.appleStroke,
    barrier: PALETTE.scienceLab.barrier,
    barrierStroke: PALETTE.scienceLab.barrierStroke,
    door: PALETTE.boxcar.door,
    doorStroke: PALETTE.boxcar.doorStroke,
  }),
  portalExitConfig: {
    1: PortalExitMode.InvertDirection,
    2: PortalExitMode.InvertDirection,
    3: PortalExitMode.InvertDirection,
    4: PortalExitMode.InvertDirection,
    5: PortalExitMode.InvertDirection,
    6: PortalExitMode.InvertDirection,
    7: PortalExitMode.InvertDirection,
    8: PortalExitMode.InvertDirection,
    9: PortalExitMode.InvertDirection,
    0: PortalExitMode.InvertDirection,
  },
  showTitle: true,
  titleVariant: TitleVariant.GrayBlue,
  musicTrack: MusicTrack.reconstitute,
};
