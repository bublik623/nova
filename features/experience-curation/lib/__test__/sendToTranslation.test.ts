import { describe, expect, test, vi } from "vitest";
import { sendToTranslation } from "../sendToTranslation";

const contentCommandApiMock = {
  translateExperience: vi.fn(),
};

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => contentCommandApiMock,
}));

describe("sendToTranslation", () => {
  test("if call the endpoint correctly", async () => {
    await sendToTranslation("random-id");

    expect(contentCommandApiMock.translateExperience).toHaveBeenCalledWith("/experiences/random-id/translate", {
      language_list: [
        { language_code: "es", to_be_translated: true, automatic_review: true },
        { language_code: "it", to_be_translated: true, automatic_review: true },
        { language_code: "de", to_be_translated: true, automatic_review: true },
        { language_code: "fr", to_be_translated: true, automatic_review: true },
        { language_code: "nl", to_be_translated: true, automatic_review: true },
        { language_code: "pl", to_be_translated: true, automatic_review: true },
        { language_code: "pt", to_be_translated: true, automatic_review: true },
        { language_code: "ru", to_be_translated: true, automatic_review: false },
        { language_code: "dk", to_be_translated: true, automatic_review: false },
        { language_code: "no", to_be_translated: true, automatic_review: true },
        { language_code: "fi", to_be_translated: true, automatic_review: true },
        { language_code: "se", to_be_translated: true, automatic_review: false },
      ],
    });
  });
});
