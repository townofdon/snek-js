import { MusicTrack } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

// aka "snekboss3"
const name = 'underground';

export const X_UNDERGROUND= challengeLevel({
  id: 'X414',
  name,
  parTime: toTime({ minutes: 0, seconds: 35 }),
  layoutV2: `dVh0KmRtNlgyKWdnZ2dnZ0xYM2k0WGRYZClMdG5kTG1BWGQpWmluTGRpJ1hLWEopWmMqJ2djKmRjck1jIVNaY1ZTcmRsZVNNYy5iU3JQZVNkWicuMFhTcjBaU1NNZXhYVyliZVNaZXhYUHlkIVNTIC0hYyFTZFB5ZC5iUyFvLWRjIGdkIWRxZC43WFNkbzY9LSFjbmNxZSdWby0nbiBnU2F4KmQtdFNhU1YnZCFkVnhhUyonZGVkZSdhJ3cnamRWU1NhJ2RidCplJ2EhLjdpd2V2KXYuWCpidGV2KVhpLjFpIWNYLWJfYmIuWHRuY3EzdzFYaXcnUGJfbShiUGJfWFctLWlwLS1XeVg0TVcoYiBtWF9YTVdrPTR2MmRKSlctLXB1fDYwOXxSSUdIVHxVTkRFUkdST1VORHwzMDAwMDBZM1kzWTYwWSMxNUMyQ0JRMTE5REE0aDIzNzU4UTJFNEE3NnNoNzJDM0ZzUTRDODJBOVEzRjZDOERRRkZGNkYxUTBBMEUxNFFFOUVGRkZ8ZmZmMHwyN3AgJyBkKGJiYilYClgqbm4uIFhXPVBYPVEtI3gndyFXTT1ZfDF8Wj1kXwooYXYpZGJYWGNkJ2VkU2YwLTAtMC1nTExoUTE2MTkyNVEyaVZWbSgobmRkby09cCEgcVgteXJQUClzUTFGMjMzM3QqKnVfbW0Kdlgud1YheFMneVgpAXl4d3Z1dHNycXBvbm1paGdmZWNiYV9aWVdWU1FQTS4qKSgnIV8%253D`,
  musicTrack: MusicTrack.slime_exitmusic,
});
