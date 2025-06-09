import { describe, expect, it, beforeEach } from "vitest";
import { ref, readonly, type Ref } from "vue";
import { useSingleSelect } from "../useSingleSelect"; // Adjust path as needed
import type { BaseOption } from "@/types/Option"; // Adjust path as needed

const options: BaseOption<string>[] = [
  {
    label: "Option Alpha",
    value: "alpha",
  },
  {
    label: "Option Beta",
    value: "beta",
  },
  {
    label: "Option Gamma",
    value: "gamma",
  },
];

describe("useSingleSelect", () => {
  let optionsRef: Ref<readonly BaseOption<string>[]>;
  let filter: Ref<string>;
  let selectedOptionValue: Ref<string | undefined>;

  beforeEach(() => {
    optionsRef = ref([...options]); // Use a fresh copy for each test
    filter = ref("");
    selectedOptionValue = ref<string | undefined>(undefined);
  });

  describe("matchingOptions", () => {
    it("includes only those among the given options whose label contains the filter value (case insensitive comparison)", () => {
      const { matchingOptions } = useSingleSelect(readonly(optionsRef), filter, selectedOptionValue);

      expect(matchingOptions.value).toStrictEqual(options);

      filter.value = "beta";
      expect(matchingOptions.value).toStrictEqual([options[1]]);

      filter.value = "OPTION"; // Case-insensitive
      expect(matchingOptions.value).toStrictEqual(options);

      optionsRef.value = [options[0], options[2]]; // Change options
      filter.value = "beta";
      expect(matchingOptions.value).toStrictEqual([]);
    });

    it("returns an empty array if no options match the filter", () => {
      const { matchingOptions } = useSingleSelect(readonly(optionsRef), filter, selectedOptionValue);

      filter.value = "NonExistent";
      expect(matchingOptions.value).toStrictEqual([]);
    });
  });

  describe("isOptionSelected", () => {
    it("returns true if the given option's value matches the selectedOptionValue", () => {
      selectedOptionValue.value = "alpha";
      const { isOptionSelected } = useSingleSelect(readonly(optionsRef), filter, selectedOptionValue);

      expect(isOptionSelected(options[0])).toBe(true);
    });

    it("returns false if the given option's value does not match the selectedOptionValue", () => {
      selectedOptionValue.value = "alpha";
      const { isOptionSelected } = useSingleSelect(readonly(optionsRef), filter, selectedOptionValue);

      expect(isOptionSelected(options[1])).toBe(false);
    });

    it("returns false if selectedOptionValue is undefined", () => {
      selectedOptionValue.value = undefined;
      const { isOptionSelected } = useSingleSelect(readonly(optionsRef), filter, selectedOptionValue);

      expect(isOptionSelected(options[0])).toBe(false);
    });
  });

  describe("selectOption", () => {
    it("sets the selectedOptionValue to the given option's value", () => {
      const { selectOption } = useSingleSelect(readonly(optionsRef), filter, selectedOptionValue);

      expect(selectedOptionValue.value).toBeUndefined();

      selectOption(options[1]);
      expect(selectedOptionValue.value).toBe("beta");

      selectOption(options[0]);
      expect(selectedOptionValue.value).toBe("alpha");
    });

    it("updates selectedOptionValue even if the option is already selected", () => {
      selectedOptionValue.value = "gamma";
      const { selectOption } = useSingleSelect(readonly(optionsRef), filter, selectedOptionValue);

      selectOption(options[2]); // Select the same option
      expect(selectedOptionValue.value).toBe("gamma");
    });
  });
});
