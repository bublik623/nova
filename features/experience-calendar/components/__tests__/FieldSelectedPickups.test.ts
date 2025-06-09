import { describe, test, expect } from "vitest";
import { mount, config, VueWrapper, MountingOptions } from "@vue/test-utils";
import FieldSelectedPickups from "../FieldSelectedPickups.vue";
import { PickupPlaceWithId } from "../../types/Pickups";
import { testId } from "@/utils/test.utils";

config.global.mocks = {
  $t: (text: string) => text,
};

describe("FieldSelectedPickups", () => {
  let wrapper: VueWrapper<InstanceType<typeof FieldSelectedPickups>>;

  const defaultProps = {
    pickups: [
      { id: "1", name: "Barcelona", address: "Barcelona Address" },
      { id: "2", name: "Milan", address: "Milan Address" },
      { id: "3", name: "Antalya", address: "Antalya Address" },
    ],
  };

  const render = (options: MountingOptions<unknown> = {}) => {
    wrapper = mount(FieldSelectedPickups, {
      props: defaultProps,
      ...options,
    });
  };

  const findPickupItems = () => wrapper.findAll(testId("pickup-place-item"));
  const findDeleteButton = (index: number) => wrapper.findAll(testId("delete-selected-pickup"))[index];

  test("renders the correct number of pickups", () => {
    render();

    expect(findPickupItems().length).toBe(3);
  });

  test("emits a 'delete' event when the delete button is clicked", async () => {
    render();

    await findDeleteButton(0).trigger("click");

    const events = wrapper.emitted<PickupPlaceWithId[]>()["delete"];

    expect(events[0][0]).toEqual(defaultProps.pickups[0]);
  });
});
