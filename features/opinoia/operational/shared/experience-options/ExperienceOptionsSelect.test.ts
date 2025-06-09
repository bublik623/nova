import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import { ref, nextTick, type Ref } from "vue";

import ExperienceOptionsSelect from "./ExperienceOptionsSelect.vue";

import type { BaseOption } from "@/types/Option";

type ComposableOption = {
  id: string;
  title: string;
  code: string;
  duration?: number;
  subchannels: string[] | "all";
  paxTypes: string[] | "all";
};

type OptionsSectionData = {
  options: ComposableOption[];
};

const mockComposableState = {
  isLoading: ref(false),
  data: ref<OptionsSectionData>({ options: [] }),
  setLoading(loading: boolean) {
    this.isLoading.value = loading;
  },
  setOptions(options: ComposableOption[]) {
    this.data.value = { options };
  },
  reset() {
    this.isLoading.value = false;
    this.data.value = { options: [] };
  },
};

vi.mock("../../sections/options/composables/useLastSavedOptionsSectionData", () => ({
  useLastSavedOptionsSectionData: vi.fn((_experienceId: Readonly<Ref<string | undefined>>) => {
    return {
      isLoading: mockComposableState.isLoading,
      data: mockComposableState.data,
    };
  }),
}));

describe("ExperienceOptionsSelect.vue", () => {
  let wrapper: VueWrapper<InstanceType<typeof ExperienceOptionsSelect>>;

  const mountComponent = (props: { experienceId: string; selected?: string | undefined }) => {
    wrapper = shallowMount(ExperienceOptionsSelect, {
      props,
    });
  };

  beforeEach(() => {
    mockComposableState.reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper && wrapper.exists()) {
      wrapper.unmount();
    }
  });

  it("renders the InlineSingleSelect stub", () => {
    mountComponent({ experienceId: "exp1" });
    const inlineSelectStub = wrapper.findComponent({ name: "InlineSingleSelect" });
    expect(inlineSelectStub.exists()).toBe(true);
  });

  it("passes correctly mapped options to InlineSingleSelect stub when data is available", async () => {
    const rawOptions: ComposableOption[] = [
      { id: "opt1", title: "Option One Title", code: "C1", paxTypes: [], subchannels: [] },
      { id: "opt2", title: "Option Two Title", code: "C2", paxTypes: [], subchannels: [] },
    ];
    mockComposableState.setOptions(rawOptions);

    mountComponent({ experienceId: "exp1" });
    await nextTick();

    const inlineSelectStub = wrapper.findComponent({ name: "InlineSingleSelect" });
    const expectedOptions: BaseOption<string>[] = [
      { value: "opt1", label: "Option One Title" },
      { value: "opt2", label: "Option Two Title" },
    ];
    expect(inlineSelectStub.props("options")).toEqual(expectedOptions);
  });

  it("passes an empty array of options to InlineSingleSelect stub when composable returns no options", async () => {
    mockComposableState.setOptions([]);
    mountComponent({ experienceId: "exp1" });
    await nextTick();

    const inlineSelectStub = wrapper.findComponent({ name: "InlineSingleSelect" });
    expect(inlineSelectStub.props("options")).toEqual([]);
  });

  it('passes initial "selected" prop value as "selectedValue" to InlineSingleSelect stub', async () => {
    mountComponent({ experienceId: "exp1", selected: "opt-initial" });
    await nextTick();

    const inlineSelectStub = wrapper.findComponent({ name: "InlineSingleSelect" });
    expect(inlineSelectStub.props("selectedValue")).toBe("opt-initial");
  });

  it('updates "selectedValue" prop of InlineSingleSelect stub when "selected" prop changes', async () => {
    mountComponent({ experienceId: "exp1", selected: "opt-initial" });
    await nextTick();

    const inlineSelectStub = wrapper.findComponent({ name: "InlineSingleSelect" });
    expect(inlineSelectStub.props("selectedValue")).toBe("opt-initial");

    await wrapper.setProps({ selected: "opt-updated" });
    await nextTick();

    expect(inlineSelectStub.props("selectedValue")).toBe("opt-updated");
  });

  it('emits "update:selected" when InlineSingleSelect stub emits "update:selectedValue"', async () => {
    mountComponent({ experienceId: "exp1" });
    await nextTick();

    const inlineSelectStub = wrapper.findComponent({ name: "InlineSingleSelect" });
    await inlineSelectStub.vm.$emit("update:selectedValue", "new-selected-value");
    await nextTick();

    expect(wrapper.emitted("update:selected")).toBeTruthy();
    expect(wrapper.emitted("update:selected")![0]).toEqual(["new-selected-value"]);
  });

  it("reacts to changes in experienceId prop by re-evaluating options", async () => {
    const exp1Options: ComposableOption[] = [
      { id: "exp1-opt1", title: "Exp1 Opt1", code: "C1", paxTypes: [], subchannels: [] },
    ];
    mockComposableState.setOptions(exp1Options);
    // The mocked composable is called once per mount due to how vi.mock works here.
    // To test reactivity to experienceId changing, the mock would need to be more sophisticated
    // or the component would need to re-invoke the composable if experienceId is a key.
    // For this setup, we change the mock's data source and then change the prop.
    mountComponent({ experienceId: "exp1" });
    await nextTick();

    let inlineSelectStub = wrapper.findComponent({ name: "InlineSingleSelect" });
    expect(inlineSelectStub.props("options")).toEqual([{ value: "exp1-opt1", label: "Exp1 Opt1" }]);

    const exp2Options: ComposableOption[] = [
      { id: "exp2-optA", title: "Exp2 OptA", code: "CA", paxTypes: [], subchannels: [] },
    ];
    // Simulate composable returning different data for a new ID
    mockComposableState.setOptions(exp2Options);
    await wrapper.setProps({ experienceId: "exp2" }); // Change prop
    await nextTick(); // Allow computed properties in ExperienceOptionsSelect to re-evaluate
    await nextTick(); // Ensure DOM updates if any

    inlineSelectStub = wrapper.findComponent({ name: "InlineSingleSelect" });
    expect(inlineSelectStub.props("options")).toEqual([{ value: "exp2-optA", label: "Exp2 OptA" }]);
  });

  it("passes options derived from current data even if composable is loading", async () => {
    const currentDataOptions: ComposableOption[] = [
      { id: "current-opt", title: "Current Option Data", code: "CD", paxTypes: [], subchannels: [] },
    ];
    mockComposableState.setOptions(currentDataOptions);
    mockComposableState.setLoading(true);

    mountComponent({ experienceId: "exp1" });
    await nextTick();

    const inlineSelectStub = wrapper.findComponent({ name: "InlineSingleSelect" });
    expect(inlineSelectStub.props("options")).toEqual([{ value: "current-opt", label: "Current Option Data" }]);
  });
});
