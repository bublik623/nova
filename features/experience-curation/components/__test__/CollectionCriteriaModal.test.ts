import { shallowMount } from "@vue/test-utils";
import CollectionCriteriaModal from "@/features/experience-curation/components/CollectionCriteriaModal.vue";
import { describe, test, expect, vi } from "vitest";
import RenderHtml from "@/components/Utils/RenderHtml/RenderHtml.vue";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

describe("CollectionCriteriaModal", () => {
  const props = {
    exceptionalExperiences: "Value 1",
    bestValueGuaranteed: "Value 2",
    createdWithCare: "Value 3",
  };

  test("renders the title correctly", () => {
    const wrapper = shallowMount(CollectionCriteriaModal, {
      props,
    });
    expect(wrapper.find("h2").text()).toBe("experience.collection-criteria.title");
  });

  test("renders the correct order of labels", () => {
    const wrapper = shallowMount(CollectionCriteriaModal, {
      props,
    });
    const fields = wrapper.findAll("h3");

    expect(fields.length).toBe(3);
    expect(fields[0].text()).toBe("experience.collection-criteria.exceptional-experiences");
    expect(fields[1].text()).toBe("experience.collection-criteria.best-value-guaranteed");
    expect(fields[2].text()).toBe("experience.collection-criteria.created-with-care");
  });

  test("mounts the RenderHtml util correctly", () => {
    const wrapper = shallowMount(CollectionCriteriaModal, {
      props,
    });
    const values = wrapper.findAllComponents(RenderHtml);

    expect(values.length).toBe(3);

    expect(values[0].props().string).toBe("Value 1");
    expect(values[1].props().string).toBe("Value 2");
    expect(values[2].props().string).toBe("Value 3");
  });

  test("renders the NoContentUtil component when field value is empty", () => {
    const wrapper = shallowMount(CollectionCriteriaModal, {
      props: {
        exceptionalExperiences: "",
        bestValueGuaranteed: "",
        createdWithCare: "",
      },
    });
    const noContentUtil = wrapper.findAllComponents({ name: "NoContentUtil" });
    expect(noContentUtil.length).toBe(3);
  });
});
