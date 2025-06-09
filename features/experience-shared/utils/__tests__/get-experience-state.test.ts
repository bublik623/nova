import { describe, expect, it } from "vitest";
import {
  getExperienceState,
  ExperienceState,
  getDistributionState,
  getTranslationState,
} from "../get-experience-state";
import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";

describe("getExperienceState", () => {
  it('should return "unpublished" when experienceStatus is "UNPUBLISHED"', () => {
    const state: ExperienceState = getExperienceState({
      experienceStatus: "UNPUBLISHED",
      mediaStatus: "READY",
    });
    expect(state).toBe("unpublished");
  });

  it('should return "ready" when experienceStatus and mediaStatus are "READY" or "SENT"', () => {
    const state: ExperienceState = getExperienceState({
      experienceStatus: "READY",
      mediaStatus: "SENT",
    });
    expect(state).toBe("ready");
  });

  it('should return "in_review" when experienceDate is present and either experienceStatus or mediaStatus is "NOT_READY"', () => {
    const state: ExperienceState = getExperienceState({
      experienceStatus: "NOT_READY",
      mediaStatus: "READY",
      experienceDate: "2022-01-01T00:00:00Z",
    });
    expect(state).toBe("in_review");
  });

  it('should return "draft" when none of the above conditions are met', () => {
    const state: ExperienceState = getExperienceState({
      experienceStatus: "NOT_READY",
      mediaStatus: "NOT_READY",
    });
    expect(state).toBe("draft");
  });

  describe("when there is no values", () => {
    it('should return "draft" when experienceStatus is undefined', () => {
      const state: ExperienceState = getExperienceState({
        mediaStatus: "READY",
      });
      expect(state).toBe("draft");
    });

    it('should return "draft" when mediaStatus is undefined', () => {
      const state: ExperienceState = getExperienceState({
        experienceStatus: "READY",
      });
      expect(state).toBe("draft");
    });

    it('should return "draft" when both experienceStatus and mediaStatus are undefined', () => {
      const state: ExperienceState = getExperienceState({});
      expect(state).toBe("draft");
    });
  });
});

describe("getDistributionState", () => {
  // its just a wrapper no need to test all cases
  it('should return "ready" when both media and English translation distribution statuses are "READY"', () => {
    const response = {
      media_content: { distribution_status: "READY" },
      translation_content_list: [{ language_code: "en", distribution_status: "READY" }],
    } satisfies DistributionContent;

    expect(getDistributionState(response)).toBe("ready");
  });
});

describe("getTranslationState", () => {
  it('should return "unpublished" when experienceStatus is "UNPUBLISHED"', () => {
    const state = getTranslationState({ experienceStatus: "UNPUBLISHED" });

    expect(state).toBe("unpublished");
  });

  it('should return "ready" when experienceStatus is "READY" or "SENT"', () => {
    const state = getTranslationState({ experienceStatus: "READY" });

    expect(state).toBe("ready");
  });

  it('should return "in_review" when experienceDate is defined and experienceStatus is "NOT_READY"', () => {
    const state = getTranslationState({ experienceStatus: "NOT_READY", experienceDate: "2022-01-01T00:00:00Z" });

    expect(state).toBe("in_review");
  });

  it('should return "draft" when none of the above conditions are met', () => {
    const state = getTranslationState({ experienceStatus: "NOT_READY" });

    expect(state).toBe("draft");
  });
});
