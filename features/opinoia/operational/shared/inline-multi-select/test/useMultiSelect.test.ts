import { describe, expect, it } from "vitest";
import { useMultiSelect } from "../useMultiSelect";
import { BaseOption } from "@/types/Option";

const options: BaseOption<string>[] = [
  {
    label: "Option A",
    value: "A",
  },
  {
    label: "Option B",
    value: "B",
  },
  {
    label: "Option C",
    value: "C",
  },
];

describe("useMultiSelect", () => {
  describe("matchingOptions", () => {
    it("includes only those among the given options whose label contains the filter value (case insensitive comparison)", () => {
      const optionsRef = ref(options);
      const filter = ref("");

      const { matchingOptions } = useMultiSelect(readonly(optionsRef), filter, ref([]));

      expect(matchingOptions.value).toStrictEqual(options);

      filter.value = "b";

      expect(matchingOptions.value).toStrictEqual([options[1]]);

      optionsRef.value = [options[0], options[2]];

      expect(matchingOptions.value).toStrictEqual([]);
    });
  });

  describe("activeMode", () => {
    it("is 'all' when selectedOptionsValues value is 'all'", () => {
      const optionsRef = ref(options);
      const filter = ref("");
      const selectedOptionsValues: Ref<string[] | "all"> = ref("all");

      const { activeMode } = useMultiSelect(readonly(optionsRef), filter, selectedOptionsValues);

      expect(activeMode.value).toBe("all");

      selectedOptionsValues.value = [];

      expect(activeMode.value).not.toBe("all");
    });

    it("is 'specific' when selectedOptionsValues value is not 'all'", () => {
      const optionsRef = ref(options);
      const filter = ref("");
      const selectedOptionsValues: Ref<string[] | "all"> = ref([]);

      const { activeMode } = useMultiSelect(readonly(optionsRef), filter, selectedOptionsValues);

      expect(activeMode.value).toBe("specific");

      selectedOptionsValues.value = "all";

      expect(activeMode.value).not.toBe("specific");
    });
  });

  describe("setMode", () => {
    it("set selectedOptionsValues to 'all' when the given mode is 'all'", () => {
      const optionsRef = ref(options);
      const filter = ref("");
      const selectedOptionsValues: Ref<string[] | "all"> = ref([]);

      const { setMode } = useMultiSelect(readonly(optionsRef), filter, selectedOptionsValues);

      setMode("all");

      expect(selectedOptionsValues.value).toBe("all");
    });

    it("set selectedOptionsValues to [] when the given mode is 'specific'", () => {
      const optionsRef = ref(options);
      const filter = ref("");
      const selectedOptionsValues: Ref<string[] | "all"> = ref("all");

      const { setMode } = useMultiSelect(readonly(optionsRef), filter, selectedOptionsValues);

      setMode("specific");

      expect(selectedOptionsValues.value).toStrictEqual([]);
    });
  });

  describe("isOptionSelected", () => {
    it("returns true if active mode is 'all'", () => {
      const optionsRef = ref(options);
      const filter = ref("");
      const selectedOptionsValues: Ref<string[] | "all"> = ref("all");

      const { isOptionSelected } = useMultiSelect(readonly(optionsRef), filter, selectedOptionsValues);

      const result = isOptionSelected(options[0]);

      expect(result).toBe(true);
    });

    it("returns true if the given option is selected", () => {
      const optionsRef = ref(options);
      const filter = ref("");
      const selectedOptionsValues: Ref<string[] | "all"> = ref([options[0].value]);

      const { isOptionSelected } = useMultiSelect(readonly(optionsRef), filter, selectedOptionsValues);

      const result = isOptionSelected(options[0]);

      expect(result).toBe(true);
    });

    it("returns false if the given option is selected", () => {
      const optionsRef = ref(options);
      const filter = ref("");
      const selectedOptionsValues: Ref<string[] | "all"> = ref([options[0].value]);

      const { isOptionSelected } = useMultiSelect(readonly(optionsRef), filter, selectedOptionsValues);

      const result = isOptionSelected(options[1]);

      expect(result).toBe(false);
    });
  });

  describe("toggleOptionSelection", () => {
    it("it adds the given option's value to the selectedOptionsValues when in 'specific' mode and the options is not already selected", () => {
      const optionsRef = ref(options);
      const filter = ref("");
      const selectedOptionsValues: Ref<string[] | "all"> = ref([options[0].value]);

      const { toggleOptionSelection } = useMultiSelect(readonly(optionsRef), filter, selectedOptionsValues);

      toggleOptionSelection(options[1]);

      expect(selectedOptionsValues.value).toStrictEqual([options[0].value, options[1].value]);
    });

    it("it removes the given option's value from the selectedOptionsValues when in 'specific' mode and the options is already selected", () => {
      const optionsRef = ref(options);
      const filter = ref("");
      const selectedOptionsValues: Ref<string[] | "all"> = ref([options[0].value, options[1].value]);

      const { toggleOptionSelection } = useMultiSelect(readonly(optionsRef), filter, selectedOptionsValues);

      toggleOptionSelection(options[1]);

      expect(selectedOptionsValues.value).toStrictEqual([options[0].value]);
    });

    it("it adds the given option's value to the selectedOptionsValues when in 'all' mode", () => {
      const optionsRef = ref(options);
      const filter = ref("");
      const selectedOptionsValues: Ref<string[] | "all"> = ref("all");

      const { toggleOptionSelection } = useMultiSelect(readonly(optionsRef), filter, selectedOptionsValues);

      toggleOptionSelection(options[1]);

      expect(selectedOptionsValues.value).toStrictEqual([options[1].value]);
    });
  });
});
