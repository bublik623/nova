import { nextTick } from "vue";
import { vi, describe, test, expect, beforeEach } from "vitest";
import { useOptionDangerousChanges } from "../useOptionDangerousChanges";
import * as useAsyncConfirmModalMock from "@/features/core-shared/composables/useAsyncConfirmModal";
import { Option } from "@/types/generated/OfferServiceApi";

const option: Partial<Option> = reactive({
  capacity_type: "language",
  pricing_type_allowed: "person",
  allowed_languages: [{ language: "en" }, { language: "fr" }],
  multilanguage: true,
});
const pricings = reactive([{ name: "mock pricing 1" }]);
const availabilities = reactive([{ name: "mock availability 1" }]);

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const modalMock = {
  openModal: vi.fn(async () => {
    throw new Error("Mock this");
  }),
};

const useAsyncConfirmModalSpy = vi.spyOn(useAsyncConfirmModalMock, "useAsyncConfirmModal");
useAsyncConfirmModalSpy.mockImplementation(() => modalMock);

vi.mock("@/features/experience-calendar/store/useExperienceOptionsStore", () => ({
  useExperienceOptionsStore: () => ({
    state: {
      option,
      availabilities,
    },
  }),
}));

vi.mock("@/features/experience-calendar/store/usePricingStore", () => ({
  usePricingStore: () => ({
    pricings,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useOptionDangerousChanges change tracking", () => {
  test("hasDangerousChanges should be true when capacity type changes", async () => {
    const { hasDangerousChanges } = useOptionDangerousChanges();

    expect(hasDangerousChanges.value).toBe(false);
    option.capacity_type = "unlimited";

    await nextTick();

    expect(hasDangerousChanges.value).toBe(true);
  });

  test("hasDangerousChanges should be true when pricing changes", async () => {
    const { hasDangerousChanges } = useOptionDangerousChanges();

    expect(hasDangerousChanges.value).toBe(false);
    pricings[0].name = "updatedTitle";
    await nextTick();
    expect(hasDangerousChanges.value).toBe(true);
  });

  test("if the pricing type has changes, both dangerousChanges and pricingTypeChanges should be true", async () => {
    const { hasDangerousChanges, hasPricingTypeChanges } = useOptionDangerousChanges();

    expect(hasDangerousChanges.value).toBe(false);
    expect(hasPricingTypeChanges.value).toBe(false);
    option.pricing_type_allowed = "group";
    await nextTick();
    expect(hasDangerousChanges.value).toBe(true);
    expect(hasPricingTypeChanges.value).toBe(true);
  });

  test("if the user changes the languages field to false, and there are availabilities, hasDangerousChanges should be true", async () => {
    const { hasDangerousChanges } = useOptionDangerousChanges();

    option.multilanguage = false;
    await nextTick();
    expect(hasDangerousChanges.value).toBe(true);
  });

  test("if the user changes the languages field to true, and there are availabilities, hasDangerousChanges should be true", async () => {
    // change initial state
    option.multilanguage = false;
    const { hasDangerousChanges } = useOptionDangerousChanges();

    option.multilanguage = true;
    await nextTick();
    expect(hasDangerousChanges.value).toBe(true);
  });

  describe("allowed languages (pre-selected languages field)", () => {
    test("if the allowed languages are the same, hasDangerousChanges should be false", async () => {
      const { hasDangerousChanges, hasAllowedLanguagesChanges } = useOptionDangerousChanges();

      expect(hasDangerousChanges.value).toBe(false);
      expect(hasAllowedLanguagesChanges.value).toBe(false);
    });

    test("removing a language from allowed languages should update hasAllowedLanguagesChanges to true", async () => {
      const { hasDangerousChanges, hasAllowedLanguagesChanges } = useOptionDangerousChanges();

      expect(hasDangerousChanges.value).toBe(false);
      expect(hasAllowedLanguagesChanges.value).toBe(false);
      // remove "fr" from allowed languages
      option.allowed_languages = [{ language: "en" }];
      await nextTick();
      expect(hasDangerousChanges.value).toBe(false);
      expect(hasAllowedLanguagesChanges.value).toBe(true);
    });

    test("adding a language to allowed languages should update hasAllowedLanguagesChanges to true", async () => {
      const { hasDangerousChanges, hasAllowedLanguagesChanges } = useOptionDangerousChanges();

      expect(hasDangerousChanges.value).toBe(false);
      expect(hasAllowedLanguagesChanges.value).toBe(false);
      // add "de" to allowed languages
      option.allowed_languages = [{ language: "en" }, { language: "fr" }, { language: "de" }];
      await nextTick();
      expect(hasDangerousChanges.value).toBe(false);
      expect(hasAllowedLanguagesChanges.value).toBe(true);
    });
  });
});

describe("useOptionDangerousChanges modals", () => {
  test("if a user declines the modal, it returns false", async () => {
    // @ts-expect-error ...
    modalMock.openModal.mockImplementationOnce(() => Promise.resolve(false));

    const { handleDangerousChanges } = useOptionDangerousChanges();

    const req = await handleDangerousChanges({
      confirmMessage: "test confirm message",
      textMessage: "test text message",
    });

    expect(modalMock.openModal).toHaveBeenCalled();
    expect(useAsyncConfirmModalMock.useAsyncConfirmModal).toHaveBeenCalledWith({
      title: "experience.options.dangerous_changes_modal.title",
      ctaCancelText: "modal.experience.delete.cancel",
      ctaConfirmText: "test confirm message",
      description:
        "\n" +
        "        experience.options.dangerous_changes_modal.description<br/>\n" +
        "        test text message\n" +
        "      ",
    });
    expect(req).toBe(false);
  });

  test("if a user accepts the modal, it returns true", async () => {
    // @ts-expect-error ...
    modalMock.openModal.mockImplementationOnce(() => Promise.resolve(true));

    const { handleDangerousChanges } = useOptionDangerousChanges();

    const req = await handleDangerousChanges({
      confirmMessage: "test confirm message",
      textMessage: "test text message",
    });

    expect(modalMock.openModal).toHaveBeenCalled();
    expect(useAsyncConfirmModalMock.useAsyncConfirmModal).toHaveBeenCalledWith({
      title: "experience.options.dangerous_changes_modal.title",
      ctaCancelText: "modal.experience.delete.cancel",
      ctaConfirmText: "test confirm message",
      description:
        "\n" +
        "        experience.options.dangerous_changes_modal.description<br/>\n" +
        "        test text message\n" +
        "      ",
    });
    expect(req).toBe(true);
  });

  test("if the pricing type has changes, it should display the pricingTypeChanges modal", async () => {
    // @ts-expect-error ...
    modalMock.openModal.mockImplementationOnce(() => Promise.resolve(true));
    const { handleDangerousChanges, hasPricingTypeChanges, hasDangerousChanges } = useOptionDangerousChanges();

    expect(hasDangerousChanges.value).toBe(false);
    expect(hasPricingTypeChanges.value).toBe(false);
    option.pricing_type_allowed = "person";
    await nextTick();
    expect(hasDangerousChanges.value).toBe(true);
    expect(hasPricingTypeChanges.value).toBe(true);

    const req = await handleDangerousChanges({
      confirmMessage: "this should not be shown",
      textMessage: "this should not be shown",
    });

    expect(hasPricingTypeChanges.value).toBe(true);

    expect(useAsyncConfirmModalMock.useAsyncConfirmModal).toHaveBeenCalledWith({
      title: "experience.options.pricing_changes_modal.title",
      ctaCancelText: "common.cancel",
      ctaConfirmText: "common.delete",
      description: "experience.options.pricing_changes_modal.description",
    });
    expect(req).toBe(true);
  });
});
