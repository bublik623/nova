import { AvailableLanguage } from "@/types/Language";
import { mount, config, flushPromises } from "@vue/test-utils";
import { vi, describe, expect, test } from "vitest";
import TranslationCustomerInformationForm from "../TranslationCustomerInformationForm.vue";

interface Values {
  info_voucher?: string;
}

interface Props {
  initialValues: Values;
  curationValues: Values;
  language: AvailableLanguage;
}

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const defaultProps: Props = {
  initialValues: {
    info_voucher: "translated voucher",
  },
  curationValues: {
    info_voucher: "curation voucher",
  },
  language: "es",
};

const selectors = {
  editorialVoucher: {
    selector: "#editorial-info-voucher",
    value: defaultProps.curationValues.info_voucher,
  },
  translationDescription: {
    selector: "#translation-info-voucher",
    value: defaultProps.initialValues.info_voucher,
  },
};

describe("TranslationCostumerInformationForm", () => {
  test("it should be rendered correctly", async () => {
    const wrapper = mount(TranslationCustomerInformationForm, {
      props: defaultProps,
    });

    await flushPromises();

    for (const [, item] of Object.entries(selectors)) {
      const { selector, value } = item;

      const field = wrapper.find(selector);

      expect(field.isVisible()).toBe(true);
      expect(field.html()).toContain(value);
    }
  });
});
