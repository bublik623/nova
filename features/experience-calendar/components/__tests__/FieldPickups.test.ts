import { describe, test, expect, vi } from "vitest";
import { mount, config, VueWrapper, MountingOptions } from "@vue/test-utils";
import FieldPickups, { FieldPickupsProps } from "../FieldPickups.vue";
import { testId } from "@/utils/test.utils";
import { PickupPlaceWithId } from "../../types/Pickups";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useId", () => "1");

vi.mock("@floating-ui/vue", () => ({
  Placement: "bottom",
  autoUpdate: () => {},
  size: () => {},
  useFloating: () => {
    return {
      floating: {
        value: {
          x: 0,
          y: 0,
        },
      },
    };
  },
}));

const optionsMock: Partial<PickupPlaceWithId>[] = [
  { id: "1", name: "Barcelona", address: "Barcelona Address" },
  { id: "2", name: "London", address: "Some Avenue. London." },
  { id: "3", name: "Antalya", address: "Antalya baris mah." },
];

describe("FieldPickups", () => {
  let wrapper: VueWrapper<InstanceType<typeof FieldPickups>>;

  const defaultProps = {
    options: optionsMock,
    modelValue: [],
  };

  const render = (options: MountingOptions<FieldPickupsProps> = {}) => {
    wrapper = mount(FieldPickups, {
      props: defaultProps,
      global: { stubs: { teleport: { template: "<div><slot/></div>" } } },
      ...options,
    });
  };

  const findSearchInput = () => wrapper.find<HTMLInputElement>(testId("field-pickups-input"));
  const findItem = (index: number) => {
    return wrapper.findAll<HTMLLabelElement>(testId("pickup-place-label"))[index];
  };
  const findDropdown = () => wrapper.find(testId("field-pickups-dropdown"));
  const findClearAllButton = () => wrapper.find(testId("dropdown-clear-all"));
  const findClear = () => wrapper.find(testId("field-pickups-clear"));
  const findNoResults = () => wrapper.find(testId("field-pickups-no-results"));

  test("renders placeholder when no option is selected", () => {
    render();

    expect(wrapper.html()).toContain("common.search.placeholder");
  });

  test("opens the dropdown when clicking on the search input", async () => {
    render();

    await findSearchInput().trigger("click");

    expect(findDropdown().exists()).toBe(true);
  });

  test("updates selected options when the model value changes", async () => {
    render({
      props: {
        ...defaultProps,
        modelValue: [
          // @ts-ignore
          optionsMock[0],
        ],
      },
    });

    await findSearchInput().trigger("click");

    expect(findItem(0).find("input").attributes("aria-checked")).toBe("true");

    await wrapper.setProps({ modelValue: [] });

    expect(findItem(0).find("input").attributes("aria-checked")).toBe("false");
  });

  test("emits selected options when selecting an option from the dropdown", async () => {
    render();

    await findSearchInput().trigger("click");

    // select first item
    await findItem(0).trigger("click");

    const events = wrapper.emitted<PickupPlaceWithId[]>()["update:modelValue"];

    // first emit
    expect(events[0][0]).toEqual([defaultProps.options[0]]);

    // select second item
    await findItem(1).trigger("click");

    // second emit
    expect(events[1][0]).toEqual([defaultProps.options[0], defaultProps.options[1]]);
  });

  test("clears selected items when clicking on the clear all button", async () => {
    render();

    await findSearchInput().trigger("click");

    // select first item
    await findItem(0).trigger("click");

    const events = wrapper.emitted<PickupPlaceWithId[]>()["update:modelValue"];

    expect(findItem(0).find("input").attributes("aria-checked")).toBe("true");
    expect(events[0][0]).toEqual([defaultProps.options[0]]);

    // clear all
    await findClearAllButton().trigger("click");

    expect(findItem(0).find("input").attributes("aria-checked")).toBe("false");
    expect(events[1][0]).toEqual([]);
  });

  test("clears the search text when the clear button is clicked", async () => {
    render();

    await findSearchInput().setValue("test");

    await findClear().trigger("click");

    expect(findSearchInput().text()).toBe("");
  });

  test('shows a "no results" message when there are no options', async () => {
    render({
      props: {
        ...defaultProps,
        options: [],
      },
    });

    await findSearchInput().setValue("Milan");

    expect(findNoResults().exists()).toBe(true);
  });
});
