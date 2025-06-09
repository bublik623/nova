import { allCustomHighlights } from "@/features/experience-highlights/lib/get-all-custom-highlights";
import { ExperienceTranslation } from "@/types/generated/ContentCommandApi";
import { AvailableLanguage } from "@/types/Language";
import { describe, test, expect, vi } from "vitest";
import { updateTranslation } from "../update-translation";
import * as commitCustomHighlightsMock from "@/features/experience-highlights/lib/commit-custom-highlights";
import { mockCustomHighlightsPayload } from "@/features/experience-highlights/lib/__mocks__/mock-custom-highlights-payload";

const TEST_ID = "translation-id";

const mockContentCommandPayload: ExperienceTranslation & {
  language_code: AvailableLanguage;
} = {
  id: TEST_ID,
  title: "test title",
  seo_title: "test seo title",
  text1: "test description",
  seo_description: "test seo description",
  info_voucher: "test info voucher",
  experience_id: "experience-id",
  language_code: "en",
  flow_code: "BASE",
  status_code: "IN_REVIEW",
};

const contentCommandApiMock = {
  putTranslation: vi.fn(),
};

const customHighlightOptions: commitCustomHighlightsMock.CustomHighlightOptions = {
  curationFlowCode: "BASE",
  toBeEditedStatusCode: "IN_REVIEW",
};

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => contentCommandApiMock,
}));

const commitCustomHighlightsSpy = vi.spyOn(commitCustomHighlightsMock, "commitCustomHighlights");

commitCustomHighlightsSpy.mockImplementation(() => Promise.resolve([]));

const mockAllCustomHighlights: allCustomHighlights = {
  custom_highlights: mockCustomHighlightsPayload("custom-highlights"),
  custom_important_information: mockCustomHighlightsPayload("custom-important-information"),
  custom_included: mockCustomHighlightsPayload("custom-included"),
  custom_non_included: mockCustomHighlightsPayload("custom-non-included"),
};
describe("updateTranslation", () => {
  test("it correctly updates a translation", async () => {
    await updateTranslation(TEST_ID, {
      translation: mockContentCommandPayload,
      highlights: mockAllCustomHighlights,
    });

    expect(contentCommandApiMock.putTranslation).toHaveBeenCalledWith(
      "experience-translations/translation-id",
      mockContentCommandPayload
    );

    expect(commitCustomHighlightsSpy).toHaveBeenNthCalledWith(
      1,
      "experience-id",
      "highlights",
      mockAllCustomHighlights.custom_highlights,
      customHighlightOptions
    );

    expect(commitCustomHighlightsSpy).toHaveBeenNthCalledWith(
      2,
      "experience-id",
      "important_information",
      mockAllCustomHighlights.custom_important_information,
      customHighlightOptions
    );

    expect(commitCustomHighlightsSpy).toHaveBeenNthCalledWith(
      3,
      "experience-id",
      "included",
      mockAllCustomHighlights.custom_included,
      customHighlightOptions
    );

    expect(commitCustomHighlightsSpy).toHaveBeenNthCalledWith(
      4,
      "experience-id",
      "non_included",
      mockAllCustomHighlights.custom_non_included,
      customHighlightOptions
    );
  });
});
