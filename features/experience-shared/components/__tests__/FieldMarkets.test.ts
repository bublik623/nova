import { describe, test, expect, vi } from "vitest";
import { mount, config } from "@vue/test-utils";
import CollapsableCheckList from "../CollapsableCheckList.vue";
import FieldMarkets, { Props } from "../FieldMarkets.vue";
import { testId } from "@/utils/test.utils";
import { Market } from "@/types/generated/ExperienceMasterDataApi";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const marketsMock: Market[] = [
  {
    id: "0bd69cfb-adc5-482d-8047-c7288d580c69",
    language_code: "en",
    code: "bo-2b",
    name: "Booking.com Market",
    category: "Booking.com",
  },
  {
    id: "234433c6-e939-4854-87f0-741949349079",
    language_code: "en",
    code: "br-2c",
    name: "Brazil",
    category: "B2C Musement",
  },
  {
    id: "ef467d4b-95f9-4296-9ade-0006035d8126",
    language_code: "en",
    code: "de-2c",
    name: "Germany",
    category: "B2C Musement",
  },
  {
    id: "b238f18f-dd7a-454f-ac33-e8f8d574b555",
    language_code: "en",
    code: "be-tx",
    name: "TUI B2C Belgium (French, Wallonia)",
    category: "B2C TUI",
  },
];

const props: Props = {
  markets: marketsMock,
  modelValue: [marketsMock[1].code, marketsMock[2].code],
};

describe("FieldMarkets", () => {
  test("it should render correctly", () => {
    const wrapper = mount(FieldMarkets, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.findAllComponents(CollapsableCheckList).length).toBe(3);
    expect(wrapper.findAllComponents(CollapsableCheckList)[1].props().modelValue).toStrictEqual([
      { value: marketsMock[1].code, label: marketsMock[1].name },
      { value: marketsMock[2].code, label: marketsMock[2].name },
    ]);
    expect(wrapper.findAllComponents(CollapsableCheckList)[0].props().options).toStrictEqual([
      { value: marketsMock[0].code, label: marketsMock[0].name },
    ]);
    expect(wrapper.findAllComponents(CollapsableCheckList)[1].props().options).toStrictEqual([
      { value: marketsMock[1].code, label: marketsMock[1].name },
      { value: marketsMock[2].code, label: marketsMock[2].name },
    ]);
    expect(wrapper.findAllComponents(CollapsableCheckList)[2].props().options).toStrictEqual([
      { value: marketsMock[3].code, label: marketsMock[3].name },
    ]);
    expect(wrapper.findAllComponents(CollapsableCheckList)[0].props().title).toBe(marketsMock[0].category);
    expect(wrapper.findAllComponents(CollapsableCheckList)[1].props().title).toBe(marketsMock[1].category);
    expect(wrapper.findAllComponents(CollapsableCheckList)[2].props().title).toBe(marketsMock[3].category);
  });

  describe("when a market is selected", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(FieldMarkets, { props });

      await wrapper.find(testId("collapsable-list-header")).trigger("click");
      await wrapper.find("#checkbox-bo-2b").trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual([...props.modelValue, marketsMock[0].code]);
    });
  });

  describe("If the readonly prop is true", () => {
    test("the collapsable list should be readonly", async () => {
      const wrapper = mount(FieldMarkets, { props: { ...props, readonly: true } });
      console.log(wrapper.html());
      expect(wrapper.findComponent({ name: "CollapsableCheckList" }).attributes("readonly")).toBe("");
    });

    test("if the modelValue is empty it should show the noContentUtil", async () => {
      const wrapper = mount(FieldMarkets, { props: { ...props, modelValue: [], readonly: true } });
      expect(wrapper.findComponent({ name: "NoContentUtil" }).isVisible()).toBeTruthy();
    });
  });
});
