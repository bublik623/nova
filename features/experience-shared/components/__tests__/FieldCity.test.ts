import { describe, test, expect, vi } from "vitest";
import { mount, config, VueWrapper, MountingOptions } from "@vue/test-utils";
import FieldCity, { type FieldCityProps } from "../FieldCity.vue";
import { testId } from "@/utils/test.utils";
import { City } from "@/types/generated/GeoMasterDataApi";
import NoContentUtil from "../NoContentUtil.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const optionsMock: City[] = [
  {
    id: "403be0f5-b40b-4df0-a7f8-5e9eb9e11641",
    code: "barcelona",
    name: "Barcelona",
    country_code_alpha2: "es",
    language_code: "en",
  },
  {
    id: "fe668778-341f-4918-bcb4-c213e0d1d2fd",
    code: "milan",
    name: "Milan",
    country_code_alpha2: "it",
    language_code: "en",
  },
  {
    id: "caa5ccbe-ec6c-4bfc-931a-fb2698953c43",
    code: "antalya",
    name: "Antalya",
    country_code_alpha2: "tr",
    language_code: "en",
  },
  {
    id: "74bcc363-c46d-43ed-ad3b-7fdf1d14c308",
    code: "madrid",
    name: "Madrid",
    country_code_alpha2: "es",
    language_code: "en",
  },
  {
    id: "74bcc363-c46d-43ed-ad3b-7fdf1d14c308",
    code: "rome",
    name: "Rome",
    country_code_alpha2: "it",
    language_code: "en",
  },
];

const defaultProps: FieldCityProps = {
  placeholder: "Search city",
  options: optionsMock,
  modelValue: null,
};

const mockedCountries: { [key: string]: {} } = {
  es: {
    id: "bdfd5912-b0bb-4ac6-87a9-fca9a22ff150",
    iso_code_alpha2: "ES",
    iso_code_alpha3: "ESP",
    iso_code_numeric: 724,
    name: "Spain",
    language_code: "es",
    description: "Spain",
    country_calling_codes: [34],
  },
  it: {
    id: "8d597a22-0cb2-408e-bf6b-6aadedae95cd",
    iso_code_alpha2: "IT",
    iso_code_alpha3: "ITA",
    iso_code_numeric: 380,
    name: "Italy",
    language_code: "it",
    description: "Italy",
    country_calling_codes: [39],
  },
  tr: {
    id: "6238747c-e980-45ac-af9e-a3bd4cf67afe",
    iso_code_alpha2: "TR",
    iso_code_alpha3: "TUR",
    iso_code_numeric: 792,
    name: "Turkey",
    language_code: "tr",
    description: "Turkey",
    country_calling_codes: [90],
  },
};
const masterDataStoreMock = {
  getCountryByCode: vi.fn((code: string) => mockedCountries[code]),
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));

describe("FieldCity", () => {
  let wrapper: VueWrapper<InstanceType<typeof FieldCity>>;

  const render = (options: MountingOptions<FieldCityProps> = {}) => {
    wrapper = mount(FieldCity, {
      props: defaultProps,
      ...options,
    });
  };

  const findSearchInput = () => wrapper.find<HTMLInputElement>(testId("city-select-input"));
  const findLabel = () => wrapper.find(testId("city-select-label"));
  const findClear = () => wrapper.find(testId("city-select-clear"));
  const findDropdown = () => wrapper.find(testId("city-select-dropdown"));
  const findItem = (index: number) => wrapper.findAll<HTMLInputElement>(testId("city-select-item"))[index];
  const findNoResults = () => wrapper.find(testId("city-select-no-results"));
  const findCountry = (countryName: string) => wrapper.find(`[data-country="${countryName}"]`);
  const findCountries = () => wrapper.findAll(testId("city-select-country"));

  test("renders placeholder when no option is selected", () => {
    render();

    expect(wrapper.html()).toContain("Search city");
  });

  test("renders countries correctly", async () => {
    render();

    await findSearchInput().trigger("click");

    expect(findCountries().length).toBe(3);

    expect(masterDataStoreMock.getCountryByCode).toHaveBeenCalledWith("es");
    expect(masterDataStoreMock.getCountryByCode).toHaveBeenCalledWith("it");
    expect(masterDataStoreMock.getCountryByCode).toHaveBeenCalledWith("tr");

    expect(findCountry("Spain").exists()).toBeTruthy();
    expect(findCountry("Italy").exists()).toBeTruthy();
    expect(findCountry("Turkey").exists()).toBeTruthy();
  });

  test("opens the dropdown when clicking on the search input", async () => {
    render();

    await findSearchInput().trigger("click");

    expect(findDropdown().exists()).toBe(true);
  });

  test("updates the selected option when selecting an option from the dropdown", async () => {
    render();

    // open the dropdown
    await findSearchInput().trigger("click");

    // click the 1st item
    await findItem(0).trigger("click");

    const events = wrapper.emitted<City[]>()["update:modelValue"];

    expect(findLabel().text()).toContain("Barcelona");
    expect(events[0][0]).toEqual(optionsMock[0]);
  });

  test("clears the selected option when the clear button is clicked", async () => {
    render();

    // open the dropdown
    await findSearchInput().trigger("click");

    // click the 1st item
    await findItem(0).trigger("click");

    // click clear
    await findClear().trigger("click");

    const events = wrapper.emitted<City[]>()["update:modelValue"];

    // second event([1]) should contain the null value (first event was selecting the option)
    expect(events[1][0]).toEqual(null);
  });

  test('shows a "no results" message when there are no options', async () => {
    render({
      props: {
        ...defaultProps,
        options: [],
      },
    });

    await findSearchInput().setValue("London");

    expect(findNoResults().exists()).toBe(true);
  });

  test("if readonly with a valid value, it should display the selected value", async () => {
    render({
      props: {
        ...defaultProps,
        modelValue: optionsMock[0],
        readonly: true,
      },
    });

    expect(wrapper.text()).toContain("BarcelonaSpain");
    expect(findDropdown().exists()).toBeFalsy();
  });

  test("if readonly without a value it should display the placeholder", () => {
    render({
      props: {
        ...defaultProps,
        modelValue: null,
        readonly: true,
      },
      shallow: true,
    });

    expect(wrapper.findComponent(NoContentUtil).exists()).toBeTruthy();
  });
});
