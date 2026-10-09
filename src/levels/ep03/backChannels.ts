import { MusicTrack } from "../../types";
import { toTime } from "../../utils";
import { v2Level } from "../v2Level";

// url: <>

export const X_BACKCHANNELS = v2Level({
  id: 'back-channels',
  name: 'backchannels',
  parTime: toTime({ minutes: 2, seconds: 0 }),
  layoutV2: 'SE9nckdySUdQVlpZWHRSKkxKTCp1cGp2TExRWEZGWFFYRkZYUUxMKU0hLmRqcElYKkxKTCpSdHVZWlZHUApyR3JnT0h8NDlTVVB8YmFja2NoYW5uZWxzZjIwMDBTNTJ3UzNmdzF8IzgzRUNEM04yMUQ0QUFxMzM5NUJOMkU0QTc2eHE3MkMzRnhONDA2RThFTjQ2Nzc5Qk5EN0RGRUFONUY4MkFCTkFGQzFENWZtbW18NmZmd1NTMy4gbz09Ki0tLS0uISBHUCBBQU1%252BfkFBIFBICl9fUHJQWFRUVExLS0xUVFR1clBfXwpJClBKKSkpbz1MWFhNISFOLSNPX1RUdShMdVhNdUxYKFBYVFRfUSlNIS5kdlJ1SVgqTFBvTW9QTCp1SVhTMHxUUFBWCkx6fip6TElZSShNKExMeUwoTShQSVpQTVgoTFh5WChYTVRfLCdmfDFnSVBNLn5%252BLlQKagpMKldXSldXKkxtLTEtMS0xbyk9cElQKmlpSmlpKlRxTjE2MTkyNU4ydE1MVClNKVRMTXVYUHYKZE0hLil3fFN4TjFGMjMzM3lpV01XaUx6Lj8ufipNAX56eXh3dnV0cXBvbWpnZl9aWVZUU1JRT05NTEpJSEcuKikhXw%253D%253D',
  annotations: {},
  musicTrack: MusicTrack.observer,
});
