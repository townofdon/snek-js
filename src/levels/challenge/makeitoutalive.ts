import { MusicTrack } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

const name = 'makeitoutalive';

export const X_MAKEITOUTALIVE = challengeLevel({
  id: 'X410',
  name,
  parTime: toTime({ minutes: 1, seconds: 5 }),
  layoutV2: `WmNjJ1ZaVm5PcFhaTnpYbk0ha0daTnd3UT0nWHpXPVhOTldHTm96U0d6J1NHTEwnU01uIGooSHApTW5NWVJSUilNbk1ZKU0hY2NYKU0hZ0FwSGRZTEwKWE0hflhYWUhWKU0hfllYWHlWYiBjJ1hiR3EtJ1gpR0tjfkchQUFIKkFHKUdHWFlwWEFHWEhzR0dYQWNHSictc0dZcCh%252BWGctcyBjVn5nSCpBRylPTz1PVlhaY2MnVgp8NTUwfFVQfG1ha2VpdG91dGFsaXZlaDAwMDAwVDM5aFRoVFQxfDAuMzh8I0YwOTE1NklFRDc5MzFmNjA1NzcwSTZENjI3RnJmNDk0NTVFckk5RTc2ODJJQUE4ODkySUUxQUE1MUlEQzk5MkVJRURDQjk2VF9fX1QyKCBWWFgoISApWApYKkFBQUcgWEgtLUktI00hKEghTnp4TyEoeVF6WG4hKEhOKClSKSoqKioqKioqKkFTWG4hTkhwKVR8MVYnWFhXWEgtKnFxPSlwIVoKJ18tMS0xLTFiKT1xSEh%252BYycnZkkzNzM0NDZJZ1ggaHwzbigqcFkhcUhISHJJNDAzRDUycydBWCl3USBkTlh5PT16eHh%252BWEcBfnp5d3NycXBuaGdmY2JfWllXVlRTUlFPTk1JSEcqKSgnIV8%253D`,
  musicTrack: MusicTrack.stonemaze,
});
