import assert from "assert";
import { DEBUG_EASY_LEVEL_EXIT, RECORD_REPLAY_STATE, SHOW_FPS } from "@/constants";

describe("Constants", () => {
  describe("DEBUG_EASY_LEVEL_EXIT", () => {
    it("should be false", () => {
      // @ts-ignore
      assert(DEBUG_EASY_LEVEL_EXIT === false);
    });
  });
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
