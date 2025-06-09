import { vi, describe, test, expect, beforeEach } from "vitest";
import { mount, config, VueWrapper, MountingOptions, flushPromises } from "@vue/test-utils";
import FieldPlaceSearch, { FieldPlaceSearchProps, SelectedPlace } from "../FieldPlaceSearch.vue";
import { getMockSuggestionsData } from "@/features/google-maps/use-places-autocomplete/__tests__/usePlacesAutoComplete.test";
import * as usePlacesAutocompleteModule from "@/features/google-maps/use-places-autocomplete";
import { testId, startsWithTestId } from "@/utils/test.utils";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

config.global.mocks = {
  $t: (text: string) => text,
};

const loadingMock = ref(true);
const suggestionsMock = ref<ReturnType<typeof getMockSuggestionsData>>([]);

const getUsePlacesAutocompleteMock = () => ({
  suggestions: suggestionsMock,
  loading: loadingMock,
  initPlaces: vi.fn(),
});

describe("FieldPlaceSearch", () => {
  let wrapper: VueWrapper<InstanceType<typeof FieldPlaceSearch>>;

  const defaultProps: FieldPlaceSearchProps = {
    fieldId: "field-id",
    modelValue: "",
    placeholder: "search",
  };

  const render = (options: MountingOptions<FieldPlaceSearchProps> = {}) => {
    wrapper = mount(FieldPlaceSearch, {
      props: defaultProps,
      ...options,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    loadingMock.value = true;
    suggestionsMock.value = [];
  });

  const findSearchInput = () => wrapper.find(`#${defaultProps.fieldId}`);
  const findClearInputButton = () => wrapper.find(testId(`${defaultProps.fieldId}-input-text-clear-btn`));
  const findDropdownSpinner = () => wrapper.find(".Dropdown__spinner");
  const findDropdownItem = (index: number) => wrapper.findAll(startsWithTestId("options-list-list-item"))[index];

  test("renders properly", async () => {
    vi.spyOn(usePlacesAutocompleteModule, "usePlacesAutocomplete").mockImplementation(() =>
      // @ts-expect-error
      getUsePlacesAutocompleteMock()
    );
    render();

    expect(findSearchInput().exists()).toBe(true);
  });

  test("opens the dropdown and starts loading when input is not empty", async () => {
    vi.spyOn(usePlacesAutocompleteModule, "usePlacesAutocomplete").mockImplementation(() =>
      // @ts-expect-error
      getUsePlacesAutocompleteMock()
    );
    render();

    await findSearchInput().setValue("test");
    expect(findDropdownSpinner().exists()).toBe(true);
  });

  test("dropdown contains suggestions", async () => {
    // @ts-expect-error
    vi.spyOn(usePlacesAutocompleteModule, "usePlacesAutocomplete").mockImplementation(() => {
      return {
        suggestions: shallowRef(getMockSuggestionsData()),
        loading: loadingMock,
        initPlaces: vi.fn(),
      };
    });

    render();

    await findSearchInput().setValue("test");

    loadingMock.value = false;
    await flushPromises();

    expect(wrapper.html()).toContain("Manila, Metro Manila, Philippines");
  });

  test("emits the select event when an option is selected from the dropdown", async () => {
    vi.spyOn(usePlacesAutocompleteModule, "getGeocode").mockResolvedValueOnce([
      // @ts-expect-error
      {
        formatted_address: "address text",
        address_components: [
          {
            long_name: "06010",
            short_name: "06010",
            types: ["postal_code"],
          },
        ],
      },
    ]);
    vi.spyOn(usePlacesAutocompleteModule, "getLatLng").mockResolvedValueOnce({ lat: 15, lng: 15 });
    // @ts-expect-error
    vi.spyOn(usePlacesAutocompleteModule, "usePlacesAutocomplete").mockImplementation(() => {
      return {
        suggestions: shallowRef(getMockSuggestionsData()),
        loading: loadingMock,
        initPlaces: vi.fn(),
      };
    });

    render();

    // trigger suggestion
    await findSearchInput().setValue("test");
    loadingMock.value = false;
    await flushPromises();

    // select first item
    await findDropdownItem(0).trigger("click");
    await flushPromises();

    expect(wrapper.emitted("select")?.[0]).toEqual([
      expect.objectContaining<SelectedPlace>({
        lat: 15,
        lng: 15,
        address: "Manila, Metro Manila, Philippines",
        placeId: "ChIJi8MeVwPKlzMRH8FpEHXV0Wk",
        postalCode: "06010",
        item: expect.any(Object),
      }),
    ]);
  });

  test("emits the clear event when input is cleared", async () => {
    vi.spyOn(usePlacesAutocompleteModule, "usePlacesAutocomplete").mockImplementation(() =>
      // @ts-expect-error
      getUsePlacesAutocompleteMock()
    );
    render();

    // type something
    await findSearchInput().setValue("test");

    // click clear btn
    await findClearInputButton().trigger("click");

    expect(wrapper.emitted("clear")).toBeTruthy();
  });

  test("if is disabled it should not be editable", async () => {
    render({
      props: {
        ...defaultProps,
        disabled: true,
      },
    });

    expect(findSearchInput().attributes("disabled")).toBe("");
  });

  test("if is readonly it should not be editable", async () => {
    render({
      props: {
        ...defaultProps,
        readonly: true,
      },
    });

    expect(findSearchInput().exists()).toBe(false);
  });
});
