import { ExperienceTranslation } from "@/types/generated/ContentCommandApi";
import { AvailableLanguage } from "@/types/Language";
import { describe, test, expect, vi } from "vitest";
import { fetchTranslation } from "../fetch-translation";

const TEST_ID = "translation-id";
const TEST_LANGUAGE = "en";

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
  getTranslations: vi.fn(() => ({
    data: [mockContentCommandPayload],
  })),
};

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => contentCommandApiMock,
}));

describe("fetchTranslation", () => {
  test("it correctly returns a translation", async () => {
    const request = await fetchTranslation(TEST_LANGUAGE, TEST_ID);

    expect(contentCommandApiMock.getTranslations).toHaveBeenCalledWith("experience-translations", {
      params: {
        filters: `experience_id==${TEST_ID}`,
        language_code: TEST_LANGUAGE,
      },
    });

    expect(request).toStrictEqual(mockContentCommandPayload);
  });

  test("it errors if there are no translations", async () => {
    contentCommandApiMock.getTranslations.mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    await expect(fetchTranslation(TEST_LANGUAGE, TEST_ID)).rejects.toThrowError(
      "Could not find any translations for experience translation-id in language en"
    );
  });

  test("it warns if there are more than one translations", async () => {
    contentCommandApiMock.getTranslations.mockImplementationOnce(() =>
      Promise.resolve({
        data: [mockContentCommandPayload, mockContentCommandPayload, mockContentCommandPayload],
      })
    );

    const logSpy = vi.spyOn(console, "warn");
    await fetchTranslation(TEST_LANGUAGE, TEST_ID);

    expect(logSpy).toHaveBeenCalledWith("Found multiple translations for translation-id in language en.");
  });
});
