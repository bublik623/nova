import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount, config, VueWrapper, ComponentMountingOptions } from "@vue/test-utils";
import { ref } from "vue";
import FieldPax from "./FieldPax.vue";
import type { Pax as ExperiencePax } from "@/types/generated/OfferServiceApi";
import type { Pax as MasterDataPax } from "@/types/generated/ExperienceMasterDataApi";
import { testId } from "@/utils/test.utils";
import { mapMasterdataPaxToExperiencePax } from "./field-pax-utils";

config.global.mocks = {
  $t: (text: string) => text,
};

const mockPaxCodes = {
  adult: "adult",
  child: "child",
  student: "student",
} as const;

const masterDataPaxMock: MasterDataPax[] = [
  {
    id: "1",
    name: mockPaxCodes.adult,
    description: "Adult",
    type: "PERSON",
    age_from: 18,
    age_to: 99,
    all_ages: false,
    language_code: "en",
    free_of_charge: false,
  },
  {
    id: "2",
    name: mockPaxCodes.child,
    description: "Child",
    type: "PERSON",
    all_ages: false,
    age_from: 0,
    age_to: 17,
    free_of_charge: false,
    language_code: "en",
  },
  {
    id: "3",
    name: mockPaxCodes.student,
    description: "Student",
    type: "PERSON",
    all_ages: false,
    language_code: "en",
    age_from: 0,
    age_to: 17,
    free_of_charge: false,
  },
];

// Mock the useGetPax hook
vi.mock("@/features/masterdata/api/useMasterdataQuery", () => ({
  useGetPaxQuery: vi.fn(() => ({
    data: ref(masterDataPaxMock),
    isLoading: ref(false),
    error: ref(null),
  })),
}));

describe("FieldPax", () => {
  let wrapper: VueWrapper<InstanceType<typeof FieldPax>>;

  const render = async (options: ComponentMountingOptions<typeof FieldPax> = {}) => {
    wrapper = mount(FieldPax, {
      props: {
        modelValue: [],
      },
      ...options,
    });
  };

  beforeEach(() => render());

  const findPaxes = () => wrapper.findAll(testId("pax-item"));
  const findPaxCheckbox = (code: string) => wrapper.find<HTMLInputElement>(`#pax-item-${code}-checkbox`);
  const findFreeOfChargeCheckbox = (code: string) => wrapper.find<HTMLInputElement>(`#pax-item-${code}-free-of-charge`);
  const findAgeFromInput = (code: string) => wrapper.find<HTMLInputElement>(`#pax-item-${code}-age-from`);
  const findAgeToInput = (code: string) => wrapper.find<HTMLInputElement>(`#pax-item-${code}-age-to`);
  const findAllAgesCheckbox = (code: string) => wrapper.find<HTMLInputElement>(`#pax-item-${code}-all-ages`);

  function getLastModelUpdate() {
    const emitted = wrapper.emitted<[ExperiencePax[]]>()["update:modelValue"];
    const lastUpdates = emitted[emitted.length - 1][0];
    return lastUpdates;
  }

  // helper function to assert that the last emitted array contains the object with the expected props
  function assertEmittedArrayContains(expectedProps: Partial<ExperiencePax>) {
    expect(getLastModelUpdate()).toEqual(expect.arrayContaining([expect.objectContaining(expectedProps)]));
  }

  test("renders pax type items with correct descriptions", () => {
    expect(findPaxes().length).toBe(masterDataPaxMock.length);
    masterDataPaxMock.forEach((pax) => {
      expect(wrapper.html()).toContain(pax.description);
    });
  });

  test("initial data should be rendered correctly", async () => {
    await wrapper.setProps({
      modelValue: [
        mapMasterdataPaxToExperiencePax({
          ...masterDataPaxMock[0],
          age_from: 44,
          age_to: 55,
          free_of_charge: true,
        }),
      ],
    });

    expect(findPaxCheckbox(mockPaxCodes.adult).attributes("aria-checked")).toBe("true");
    expect(findAllAgesCheckbox(mockPaxCodes.adult).attributes("aria-checked")).toBe("false");
    expect(findFreeOfChargeCheckbox(mockPaxCodes.adult).attributes("aria-checked")).toBe("true");
    expect(findAgeFromInput(mockPaxCodes.adult).element.value).toBe("44");
    expect(findAgeToInput(mockPaxCodes.adult).element.value).toBe("55");
  });

  test("adds a new pax type when selected", async () => {
    const checkbox = findPaxCheckbox(mockPaxCodes.adult);
    await checkbox.trigger("click");

    assertEmittedArrayContains({ pax_code: mockPaxCodes.adult });
  });

  test("removes a pax type when deselected", async () => {
    // First add a pax
    const checkbox = findPaxCheckbox(mockPaxCodes.student);
    await checkbox.trigger("click");
    assertEmittedArrayContains({ pax_code: mockPaxCodes.student });

    // Then remove it
    await checkbox.trigger("click");

    // expect the last update to be an empty array
    expect(getLastModelUpdate()).toEqual([]);
  });

  test("updates pax type properties", async () => {
    // First select the pax type
    await findPaxCheckbox(mockPaxCodes.adult).trigger("click");
    assertEmittedArrayContains({ pax_code: mockPaxCodes.adult });

    // Update all_ages
    await findAllAgesCheckbox(mockPaxCodes.adult).trigger("click");
    assertEmittedArrayContains({ pax_code: mockPaxCodes.adult, all_ages: true });

    // Update free_of_charge
    await findFreeOfChargeCheckbox(mockPaxCodes.adult).trigger("click");
    assertEmittedArrayContains({ pax_code: mockPaxCodes.adult, free_of_charge: true });

    // before updating age range, we need to uncheck all_ages
    await findAllAgesCheckbox(mockPaxCodes.adult).trigger("click");
    assertEmittedArrayContains({ pax_code: mockPaxCodes.adult, all_ages: false });

    // Update age range
    await findAgeFromInput(mockPaxCodes.adult).setValue(14);
    assertEmittedArrayContains({ pax_code: mockPaxCodes.adult, age_from: 14 });
    await findAgeToInput(mockPaxCodes.adult).setValue(20);
    assertEmittedArrayContains({ pax_code: mockPaxCodes.adult, age_to: 20 });
  });

  test("preserves other pax types when updating one", async () => {
    // First select an initial pax
    const adultPaxCode = mockPaxCodes.adult;
    await findPaxCheckbox(adultPaxCode).trigger("click");
    assertEmittedArrayContains({ pax_code: adultPaxCode });

    // Then select and update another pax
    const studentPaxCode = mockPaxCodes.student;
    await findPaxCheckbox(studentPaxCode).trigger("click");
    await findFreeOfChargeCheckbox(studentPaxCode).trigger("click");
    assertEmittedArrayContains({ pax_code: studentPaxCode, free_of_charge: true });

    // Verify both exist in the last update
    const lastUpdates = getLastModelUpdate();
    expect(lastUpdates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pax_code: adultPaxCode }),
        expect.objectContaining({ pax_code: studentPaxCode, free_of_charge: true }),
      ])
    );
  });
});
