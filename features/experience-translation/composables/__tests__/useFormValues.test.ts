import { describe, test, expect, vi } from "vitest";
import { useFormValues } from "../useFormValues";

const myCallback = vi.fn();

const initialValues = {
  title: "My title",
  description: "My description",
};

describe("useFormValues", () => {
  test("it returns the correct form values ", () => {
    const { formValues } = useFormValues(initialValues, myCallback);

    expect(formValues.value).toStrictEqual(initialValues);
    // should not call the callback on first invokation
    expect(myCallback).not.toHaveBeenCalledOnce();
  });

  test("it invokes the callback correctly", async () => {
    vi.useFakeTimers();
    const { formValues } = useFormValues(initialValues, myCallback);

    formValues.value.title = "update title I guess";

    await vi.runOnlyPendingTimersAsync();

    expect(myCallback).toHaveBeenCalledOnce();
  });
});
