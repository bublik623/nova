import { describe, test, expect } from "vitest";
import { nextTick } from "vue";
import { useFormPercentageCompletion } from "../useFormPercentageCompletion";

const fields = ref([
  { id: "field-1", required: true, filled: true },
  { id: "field-2", required: true, filled: false },
  { id: "field-3", required: false, filled: true },
  { id: "field-4", required: false, filled: false },
]);

describe("useFormPercentageCompletion", () => {
  test("it should calculate the percentage of the completion of the form fields", async () => {
    const percentage = useFormPercentageCompletion(fields);
    expect(percentage.value).toBe(50);

    fields.value[2].filled = true;
    await nextTick();
    expect(percentage.value).toBe(50);

    fields.value[3].filled = true;
    await nextTick();
    expect(percentage.value).toBe(50);

    fields.value[1].filled = true;
    await nextTick();
    expect(percentage.value).toBe(100);
  });

  describe("if there are no fields", () => {
    test("it should return zero", () => {
      const percentage = useFormPercentageCompletion([]);
      expect(percentage.value).toBe(0);
    });
  });
});
