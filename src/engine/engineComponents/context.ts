import { Context } from "@/types";
export { Context } from "@/types";

export const withContext = (ctx: Context) => <T, Y extends Array<any>>(thunk: (ctx: Context, ...params: Y) => T, ...params: Y): T => {
  return thunk(ctx, ...params);
}
