import assert from "assert";
import { RECORD_REPLAY_STATE, SHOW_FPS } from "@/constants";

describe("Constants", () => {
  describe("SHOW_FPS", () => {
    it("should be false", () => {
      // @ts-ignore
      assert(SHOW_FPS === false);
    });
  });
  describe("RECORD_REPLAY_STATE", () => {
    it("should be false", () => {
      // @ts-ignore
      assert(RECORD_REPLAY_STATE === false);
    });
  });
});
