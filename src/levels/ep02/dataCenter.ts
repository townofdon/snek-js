import { MusicTrack, ItemDropType } from "../../types";
import { toTime } from "../../utils";
import { v2Level } from "../v2Level";

export const X_DATACENTER = v2Level({
  id: 'X420',
  name: 'datacenter',
  parTime: toTime({ minutes: 1, seconds: 15 }),
  layoutV2: `Ulh5YiE9aWkheSggSCwnLCd2KytIZmR2ZGZIZmRwcGl3eiBpcHBkZkhmZEpsZGZ3TlhnWHEgZmRrSmRmSFdXd04xVDlxIFdXSFgxMTExWHdOMXg5cSBYMzMzM1ggKXliLU4xVDlxKGIpUypOMXg5cU0qLVMhVVVTIW9OClVtVShOMzMzM1hHWDk5OTlYWSg9c0dzWSg9fkd%252BWShOOTk5OVhHWDAwMDBYWW1xLVMhVVUhIU1TKk45eDBxUykhKCgqTjlUMHFoIVpOOXgwcUkgaWpkICpOOVQwcUlaTlhnWHFJWnpJKCgqUWhTKlFTKVMhIWlpUyEhWFJ8NzNWVVB8ZGF0YWNlbnRlcnwxMjAwMFY2VlZWM3wxfDEyfDAuODF8I0RCQUU5NU9DMjdBNTBPMTYxOTI1TzgyOThhYU83NDlmZDBPMUYyMzMzTzE2MTkyNU8yNzJDM0ZPMUYyMzMzTzM3NTM2YU8zYTUzNzBPNzI5RkMwTzQ2Nzc5Qk80QzgyQTl8dXV1MXwzfFZWVlZWMSE9PWIgKU4KcT0tRz1fLVVVLV89SCApPSBJPUtBQUFBSyFYClghTVMpKm9vb289Z1VVZypvb29vKU49WE8tI1EtK2lpK29SCldycnJycnJYWFVVTExMTFVVWFhycnJycnJXClMhISEhVCBBVjB8V1hYWFl5VQpVWiBpaSAqYiggIGcvL2g9S0tLS0tLIVgKWGlkZG0hIVdXR1dXISFVCm8tLXFYKnMvQVQgL3UxLTEtMS12cHBwX29RLV9wcHB3IC14QSB5PSh6IStpKyEtfi9UVC8Bfnp5eHd2dXNxb21paGdiWllXVlRTUlFPTk1JSEcqKSghXw%253D%253D`,
  musicTrack: MusicTrack.simpleTime,
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: false,
  },
});
