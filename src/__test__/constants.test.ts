import assert from "assert";
import { DEBUG_EASY_LEVEL_EXIT } from "@/constants";

describe("Constants", () => {
  describe("DEBUG_EASY_LEVEL_EXIT", () => {
    it("should be false", () => {
      // @ts-ignore
      assert(DEBUG_EASY_LEVEL_EXIT === false);
    });
  });
});
