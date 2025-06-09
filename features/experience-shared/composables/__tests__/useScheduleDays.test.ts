import { describe, test, expect, vi } from "vitest";
import { useScheduleDays } from "../useScheduleDays";

describe("useScheduleDays", () => {
  test("it should return a `ScheduleDaysValue` object based on the range passed as prop", () => {
    let scheduleDays = useScheduleDays(
      ref({
        from: new Date(2100, 10, 5),
        to: new Date(2100, 10, 9),
      })
    );
    expect(scheduleDays.value).toStrictEqual({
      Mon: {
        checked: true,
        isDisabled: false,
      },
      Tue: {
        checked: true,
        isDisabled: false,
      },
      Wed: {
        checked: false,
        isDisabled: true,
      },
      Thu: {
        checked: false,
        isDisabled: true,
      },
      Fri: {
        checked: true,
        isDisabled: false,
      },
      Sat: {
        checked: true,
        isDisabled: false,
      },
      Sun: {
        checked: true,
        isDisabled: false,
      },
    });

    scheduleDays = useScheduleDays(
      ref({
        from: new Date(2100, 10, 5),
        to: new Date(2100, 10, 15),
      })
    );
    expect(scheduleDays.value).toStrictEqual({
      Mon: {
        checked: true,
        isDisabled: false,
      },
      Tue: {
        checked: true,
        isDisabled: false,
      },
      Wed: {
        checked: true,
        isDisabled: false,
      },
      Thu: {
        checked: true,
        isDisabled: false,
      },
      Fri: {
        checked: true,
        isDisabled: false,
      },
      Sat: {
        checked: true,
        isDisabled: false,
      },
      Sun: {
        checked: true,
        isDisabled: false,
      },
    });

    scheduleDays = useScheduleDays(
      ref({
        from: new Date(2100, 10, 5),
        to: new Date(2100, 10, 5),
      })
    );
    expect(scheduleDays.value).toStrictEqual({
      Mon: {
        checked: false,
        isDisabled: true,
      },
      Tue: {
        checked: false,
        isDisabled: true,
      },
      Wed: {
        checked: false,
        isDisabled: true,
      },
      Thu: {
        checked: false,
        isDisabled: true,
      },
      Fri: {
        checked: true,
        isDisabled: false,
      },
      Sat: {
        checked: false,
        isDisabled: true,
      },
      Sun: {
        checked: false,
        isDisabled: true,
      },
    });
  });

  describe("if the range changes ", () => {
    test("it should update the scheduleDays object", async () => {
      const range = ref({
        from: new Date(2100, 10, 5),
        to: new Date(2100, 10, 9),
      });

      const scheduleDays = useScheduleDays(range);
      expect(scheduleDays.value).toStrictEqual({
        Mon: {
          checked: true,
          isDisabled: false,
        },
        Tue: {
          checked: true,
          isDisabled: false,
        },
        Wed: {
          checked: false,
          isDisabled: true,
        },
        Thu: {
          checked: false,
          isDisabled: true,
        },
        Fri: {
          checked: true,
          isDisabled: false,
        },
        Sat: {
          checked: true,
          isDisabled: false,
        },
        Sun: {
          checked: true,
          isDisabled: false,
        },
      });

      range.value = {
        from: new Date(2100, 10, 5),
        to: new Date(2100, 10, 6),
      };
      await Promise.resolve();
      expect(scheduleDays.value).toStrictEqual({
        Mon: {
          checked: false,
          isDisabled: true,
        },
        Tue: {
          checked: false,
          isDisabled: true,
        },
        Wed: {
          checked: false,
          isDisabled: true,
        },
        Thu: {
          checked: false,
          isDisabled: true,
        },
        Fri: {
          checked: true,
          isDisabled: false,
        },
        Sat: {
          checked: true,
          isDisabled: false,
        },
        Sun: {
          checked: false,
          isDisabled: true,
        },
      });
    });
  });

  describe("if a callback is provided", () => {
    test("it should call it when scheduleDays changes", async () => {
      const range = ref({
        from: new Date(2100, 10, 5),
        to: new Date(2100, 10, 9),
      });
      const callback = vi.fn();

      useScheduleDays(range, callback);

      range.value = {
        from: new Date(2100, 10, 5),
        to: new Date(2100, 10, 6),
      };
      await Promise.resolve();
      expect(callback).toHaveBeenCalled();
    });
  });
});
