import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import NovaPhoneNumber, { Props } from "./NovaPhoneNumber.vue";
import { testId } from "@/utils/test.utils";

const props: Props = {
  countries: [
    {
      id: "d67d6f2d-0c46-45d2-b594-5da917767432",
      iso_code_alpha2: "BV",
      iso_code_alpha3: "BVT",
      iso_code_numeric: 74,
      name: "Bouvet Island",
      language_code: "no",
      description: "Bouvet Island",
      country_calling_codes: [55],
    },
    {
      id: "a6de0e47-c5f5-467f-a520-1f426f681d2b",
      iso_code_alpha2: "BR",
      iso_code_alpha3: "BRA",
      iso_code_numeric: 76,
      name: "Brazil",
      language_code: "pt",
      description: "Brazil",
      country_calling_codes: [55],
    },
    {
      id: "a078ead3-fe0b-4ca5-834a-fbfed30b6a06",
      iso_code_alpha2: "IO",
      iso_code_alpha3: "IOT",
      iso_code_numeric: 86,
      name: "British Indian Ocean Territory (the)",
      language_code: "en",
      description: "British Indian Ocean Territory (the)",
      country_calling_codes: [246],
    },
    {
      id: "a074b887-9844-4a7f-a4f6-fbbdce9f5276",
      iso_code_alpha2: "BN",
      iso_code_alpha3: "BRN",
      iso_code_numeric: 96,
      name: "Brunei Darussalam",
      language_code: "ms",
      description: "Brunei Darussalam",
      country_calling_codes: [673],
    },
    {
      id: "5ec3fbc3-6c6d-40e8-876a-4b5f95adfd86",
      iso_code_alpha2: "BG",
      iso_code_alpha3: "BGR",
      iso_code_numeric: 100,
      name: "Bulgaria",
      language_code: "bg",
      description: "Bulgaria",
      country_calling_codes: [359],
    },
    {
      id: "d90aaa20-625c-49fc-ae8b-ff0febd18f73",
      iso_code_alpha2: "BF",
      iso_code_alpha3: "BFA",
      iso_code_numeric: 854,
      name: "Burkina Faso",
      language_code: "fr",
      description: "Burkina Faso",
      country_calling_codes: [226],
    },
  ],
  prefix: undefined,
  number: undefined,
  placeholders: {
    phoneNumberInput: "phone number placeholder",
    phonePrefixSearch: "phone prefix placeholder",
    noItemFound: "no item placeholder",
    readonlyEmpty: "readonly empty placeholder",
  },
};

const selectors = {
  countryCodeBtn: testId("country-code-btn"),
  inputPhoneNumber: testId("input-phone-number"),
  inputSearch: testId("input-search-country-code"),
  selectedPrefix: testId("phone-number-prefix"),
  list: ".Dropdown__list",
  listItems: ".OptionsList__list-item",
  deleteBtn: testId("nova-button-icon"),
  clearBtn: testId("input-phone-clear"),
  phoneNumber: testId("phone-number"),
};

describe("NovaPhoneNumber", () => {
  test("it should render correctly", async () => {
    const wrapper = mount(NovaPhoneNumber, { props });
    expect(wrapper).toBeTruthy();

    const inputPhoneNumberPlaceholder = wrapper.find(selectors.inputPhoneNumber).attributes("placeholder");

    // check placeholders
    const { placeholders } = props;
    expect(inputPhoneNumberPlaceholder).toBe(placeholders?.phoneNumberInput);

    expect(wrapper.find(selectors.selectedPrefix).text()).toBe("+00");
    await wrapper.find(selectors.countryCodeBtn).trigger("click");

    const inputSearchPlaceholder = wrapper.find(selectors.inputSearch).attributes("placeholder");

    expect(inputSearchPlaceholder).toBe(placeholders?.phonePrefixSearch);

    const inputSearch = wrapper.find(selectors.inputSearch);
    await inputSearch.setValue("aaAAaaaAAa!");
    expect(wrapper.text().includes(placeholders?.noItemFound ?? ""));
  });

  test("the user should be able to filter the prefix", async () => {
    const wrapper = mount(NovaPhoneNumber, { props, attachTo: document.body });

    await wrapper.find(selectors.countryCodeBtn).trigger("click");
    const inputSearch = wrapper.find(selectors.inputSearch);

    // check if the right input is focused
    expect(inputSearch.element).toBe(document.activeElement);

    // check the filter
    expect(wrapper.findAll(selectors.listItems).length).toBe(6);
    await inputSearch.setValue("e");
    expect(wrapper.findAll(selectors.listItems).length).toBe(3);
    await inputSearch.setValue("bul");
    expect(wrapper.findAll(selectors.listItems).length).toBe(1);
    await inputSearch.setValue("3");
    expect(wrapper.findAll(selectors.listItems).length).toBe(2);
    await inputSearch.setValue("31");
    expect(wrapper.findAll(selectors.listItems).length).toBe(0);
    await inputSearch.setValue("Brazil");
    expect(wrapper.findAll(selectors.listItems).length).toBe(1);

    // select the prefix
    const chosenPrefix = wrapper.findAll(selectors.listItems)[0];
    await chosenPrefix.trigger("click");

    // check if the right event is emitted
    const events = wrapper.emitted<Event[]>()["update:prefix"];
    expect(events[0][0]).toStrictEqual(55);

    //check if the right input is focused
    const inputPhoneNumber = wrapper.find(selectors.inputPhoneNumber);
    expect(inputPhoneNumber.element).toBe(document.activeElement);
  });

  test("the user should be able to insert the phone number", async () => {
    const wrapper = mount(NovaPhoneNumber, { props });
    const inputPhoneNumber = () => wrapper.find<HTMLInputElement>(selectors.inputPhoneNumber);

    const expectedValue = "12345";
    await inputPhoneNumber().setValue(expectedValue);
    expect(inputPhoneNumber().element.value).toBe(expectedValue);

    const events = wrapper.emitted<unknown[]>()["update:number"];
    expect(events[0][0]).toStrictEqual(expectedValue);
  });

  test("it should emit the selected country code", async () => {
    const wrapper = mount(NovaPhoneNumber, { props });

    await wrapper.find(selectors.countryCodeBtn).trigger("click");

    // select the prefix
    const chosenPrefix = wrapper.findAll(selectors.listItems)[0];
    await chosenPrefix.trigger("click");

    const events = wrapper.emitted<unknown[]>()["update:countryCode"];
    expect(events[0][0]).toStrictEqual("BV");
  });

  test("the user should be able to clear the input", async () => {
    const wrapper = mount(NovaPhoneNumber, {
      props: { ...props, prefix: "+39", number: "123456" },
    });

    await wrapper.find(selectors.clearBtn).trigger("click");

    const events = wrapper.emitted<unknown[]>()["update:number"];
    expect(events[0][0]).toStrictEqual("");
  });

  test("check if the error props work", () => {
    const wrapper = mount(NovaPhoneNumber, {
      props: { ...props, error: "test-error" },
    });

    expect(wrapper.html()).include("test-error");
    expect(wrapper.find(".PhoneNumber").attributes("error")).toBeTruthy();
  });

  test("check if the disabled props work", async () => {
    const wrapper = mount(NovaPhoneNumber, {
      props: { ...props, disabled: true },
    });

    expect(wrapper.find(".PhoneNumber").attributes("disabled")).toBeTruthy();
  });

  test("it should show the right flag", () => {
    const wrapper = mount(NovaPhoneNumber, {
      props: { ...props, prefix: "+55", number: "123456" },
    });
    expect(wrapper.find(testId("country-flag-bv")).isVisible()).toBeTruthy();
    expect(wrapper.find(selectors.selectedPrefix).text()).toBe("+55");
  });

  describe("if is readonly", () => {
    test("it should show the flag, the prefix and the number", () => {
      const wrapper = mount(NovaPhoneNumber, {
        props: { ...props, prefix: "55", number: "123456", readonly: true },
      });
      expect(wrapper.find(testId("country-flag-bv")).isVisible()).toBeTruthy();
      expect(wrapper.find(selectors.selectedPrefix).text()).toBe("+55");
      expect(wrapper.find(selectors.phoneNumber).text()).toBe("123456");
    });

    test("it should show the flag, the prefix and the placeholder", () => {
      const wrapper = mount(NovaPhoneNumber, {
        props: { ...props, prefix: "55", number: "", readonly: true },
      });
      expect(wrapper.find(testId("country-flag-bv")).isVisible()).toBeTruthy();
      expect(wrapper.find(selectors.selectedPrefix).text()).toBe("+55");
      expect(wrapper.find(selectors.phoneNumber).exists()).toBeFalsy();
      expect(wrapper.text().includes("readonly empty placeholder")).toBeTruthy();
    });

    test("it should the number", () => {
      const wrapper = mount(NovaPhoneNumber, {
        props: { ...props, number: "324000", readonly: true },
      });
      expect(wrapper.find(testId("country-flag-bv")).exists()).toBeFalsy();
      expect(wrapper.find(selectors.selectedPrefix).exists()).toBeFalsy();
      expect(wrapper.find(selectors.phoneNumber).text()).toBe("324000");
    });

    test("it should the placeholder", () => {
      const wrapper = mount(NovaPhoneNumber, {
        props: { ...props, number: "", readonly: true },
      });
      expect(wrapper.find(testId("country-flag-bv")).exists()).toBeFalsy();
      expect(wrapper.find(selectors.selectedPrefix).exists()).toBeFalsy();
      expect(wrapper.find(selectors.phoneNumber).exists()).toBeFalsy();
      expect(wrapper.text().includes("readonly empty placeholder")).toBeTruthy();
    });
  });
});
