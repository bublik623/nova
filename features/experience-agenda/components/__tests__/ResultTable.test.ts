import { config, mount } from "@vue/test-utils";
import ResultTable, { Props } from "@/features/experience-agenda/components/ResultTable.vue";
import { describe, expect, test, vi } from "vitest";
import { CapacityType } from "@/types/Options";

config.global.mocks = {
  $t: (text: string) => text,
};
const props: Props = {
  slots: [
    {
      id: "1",
      timeslice_id: "1",
      time: "09:00:00",
      option: { capacity_type: CapacityType.UNLIMITED, name: "option-1" },
      bookings: 0,
      total_capacity: 7,
      remaining_capacity: 7,
      aggregationSlots: [
        {
          id: "1",
          timeslice_id: "1",
          time: "09:00:00",
          option: { capacity_type: CapacityType.UNLIMITED, name: "option-1" },
          pricing: { age_range: { from: 2, to: 30 }, holder: "Adults" },
          bookings: 0,
          total_capacity: 7,
          remaining_capacity: 7,
        },
      ],
    },
    {
      id: "2",
      timeslice_id: "2",
      bookings: 1,
      total_capacity: 4,
      remaining_capacity: 3,
      option: { capacity_type: CapacityType.SHARED, name: "option-2" },
      aggregationSlots: [
        {
          id: "2",
          timeslice_id: "2",
          time: "09:00:00",
          option: { capacity_type: CapacityType.SHARED, name: "option-2" },
          pricing: { age_range: { from: 2, to: 30 }, holder: "Adults" },
          bookings: 1,
          total_capacity: 4,
          remaining_capacity: 3,
        },
        {
          id: "3",
          timeslice_id: "2",
          time: "09:00:00",
          option: { capacity_type: CapacityType.SHARED, name: "option-2" },
          pricing: { age_range: { from: 2, to: 30 }, holder: "Adults" },
          bookings: 1,
          total_capacity: 4,
          remaining_capacity: 3,
        },
      ],
    },
  ],
  date: "2023-03-18",
  checkedTimeSliceIds: ["1", "2"],
  onUpdateCapacity: vi.fn(),
};

describe("ResultTable", () => {
  test("it should render correctly", () => {
    const wrapper = mount(ResultTable, { props });

    const titles = wrapper.findAll("th");
    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.find(".NovaCollapse__header").text()).toBe("Sat, 18 Mar 2023");

    expect(titles[0].text()).toBe("");
    expect(titles[1].text()).toBe("experience.agenda.table.start-time");
    expect(titles[2].text()).toBe("experience.agenda.table.option-name");
    expect(titles[3].text()).toBe("experience.agenda.table.booked");
    expect(titles[4].text()).toBe("experience.agenda.table.available");
    expect(titles[5].text()).toBe("experience.agenda.table.total");
    expect(titles[6].text()).toBe("experience.agenda.table.actions");
    expect(titles[7].text()).toBe("experience.agenda.table.status");
    expect(titles[8].text()).toBe("");
  });

  test("if all the options are unlimited it should not show the total and the actions", () => {
    const wrapper = mount(ResultTable, {
      props: { ...props, slots: [{ ...props.slots[0] }] },
    });

    const titles = wrapper.findAll("th");
    expect(wrapper.exists()).toBeTruthy();
    expect(titles[0].text()).toBe("");
    expect(titles[1].text()).toBe("experience.agenda.table.start-time");
    expect(titles[2].text()).toBe("experience.agenda.table.option-name");
    expect(titles[3].text()).toBe("experience.agenda.table.booked");
    expect(titles[4].text()).toBe("experience.agenda.table.available");
    expect(titles[5].text()).toBe("");
    expect(titles[6].text()).toBe("");
  });

  test("if the 'time' property is not present, it should not show the time row", () => {
    const wrapper = mount(ResultTable, {
      props: { ...props, slots: [{ ...props.slots[0], time: undefined }] },
    });

    const titles = wrapper.findAll("th");
    expect(wrapper.exists()).toBeTruthy();
    expect(titles[0].text()).toBe("");
    expect(titles[1].text()).toBe("experience.agenda.table.option-name");
    expect(titles[2].text()).toBe("experience.agenda.table.booked");
    expect(titles[3].text()).toBe("experience.agenda.table.available");
    expect(titles[4].text()).toBe("");
  });

  test("if the user click on a checkbox, it should emit an event", async () => {
    const wrapper = mount(ResultTable, { props });
    const checkbox = wrapper.findAll(".checkbox-container__checkbox");
    await checkbox[0].trigger("click");
    await checkbox[1].trigger("click");

    const events = wrapper.emitted<string[]>()["toggle:check-slots"];
    expect(events[0][0]).toStrictEqual(["1", "2"]);
    expect(events[1][0]).toStrictEqual(["1"]);
  });

  describe("if is readonly", () => {
    test("it should not show the checkbox", () => {
      const wrapper = mount(ResultTable, { props: { ...props, readonly: true } });

      expect(wrapper.find(".checkbox-container__checkbox").exists()).toBeFalsy();
    });
  });
});
