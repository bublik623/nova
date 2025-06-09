import { config, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import AdvancedSearchTranslationRow from "@/features/advanced-search/components/AdvancedSearchTable/AdvancedSearchTranslationRow.vue";
import { testId } from "@/utils/test.utils";

const props = {
  translation: {
    experience_id: "exp-id",
    language_code: "it",
    experience_translation: { title: "title", distribution_status: "", distribution_date: "" },
  },
  experienceMedia: { distribution_status: "" },
  scrollShadowOpacity: 0,
};

const routerMock = {
  push: vi.fn(),
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

config.global.mocks = {
  $t: (s: string) => s,
  $router: routerMock,
};
describe("AdvancedSearchTranslationRow", () => {
  describe("if the user click on the title", () => {
    test("it should redirect to the product page", async () => {
      const wrapper = mount(AdvancedSearchTranslationRow, { props });

      await wrapper.find(testId("adv-search-translation-row-title")).trigger("click");

      expect(routerMock.push).toHaveBeenCalledWith("/experience/exp-id/translation/it/settings");
      expect(wrapper.exists()).toBeTruthy();
    });
  });
});
