import { vi, describe, test, expect, beforeEach, beforeAll } from "vitest";
import { useActivityLog } from "./useActivityLog";
import { useCompletionPercentage } from "../../shared/completion-percentage/useCompletionPercentage";
import { useActionsSidebar } from "./useActionsSidebar";
import { useOpinoiaExperience } from "../../shared/useOpinoiaExperience";

const experienceId = "exp-id";

const useOpinoiaExperienceMock = vi.hoisted(() => vi.fn<() => ReturnType<typeof useOpinoiaExperience>>());
vi.mock("../../shared/useOpinoiaExperience", () => ({
  useOpinoiaExperience: useOpinoiaExperienceMock,
}));

const useActivityLogMock = vi.hoisted(() => vi.fn<() => ReturnType<typeof useActivityLog>>());
vi.mock("./useActivityLog", () => ({
  useActivityLog: useActivityLogMock,
}));

const useCompletionPercentageMock = vi.hoisted(() => vi.fn<() => ReturnType<typeof useCompletionPercentage>>());
vi.mock("../../shared/completion-percentage/useCompletionPercentage", () => ({
  useCompletionPercentage: useCompletionPercentageMock,
}));

const experienceStateValue = "draft";
const lastEditDateValue = "LAST_EDIT_DATE";
const completionPercentageValue = 10;

describe("useActionsSidebar", () => {
  beforeAll(() => {
    useOpinoiaExperienceMock.mockReturnValue(
      // @ts-ignore
      computed(() => ({
        experienceState: experienceStateValue,
      }))
    );

    useActivityLogMock.mockReturnValue({
      lastEditDate: computed(() => lastEditDateValue),
    });

    useCompletionPercentageMock.mockReturnValue(computed(() => completionPercentageValue));
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("experienceState", () => {
    test("it contains the experience state from the opinoia experience with the given id", () => {
      const { experienceState } = useActionsSidebar(ref(experienceId));

      expect(experienceState.value).toEqual(experienceStateValue);

      expect(useOpinoiaExperienceMock).toHaveBeenCalledOnce();
      const [expId] = useOpinoiaExperienceMock.mock.calls[0] as unknown as [Ref<string>];
      expect(expId.value).toEqual(experienceId);
    });
  });

  describe("lastEditDate", () => {
    test("it contains the last edit date from the activity log for the experience with the given id", () => {
      const { lastEditDate } = useActionsSidebar(ref(experienceId));

      expect(lastEditDate.value).toEqual(lastEditDateValue);

      expect(useActivityLogMock).toHaveBeenCalledOnce();

      const [expId, languageCode] = useActivityLogMock.mock.calls[0] as unknown as [Ref<string>, Ref<string>];
      expect(expId.value).toEqual(experienceId);
      expect(languageCode.value).toEqual("en");
    });
  });

  describe("completionPercentage", () => {
    test("it contains the completion percentage of the given fields", () => {
      const { completionPercentage } = useActionsSidebar(ref(experienceId));

      expect(completionPercentage.value).toEqual(completionPercentageValue);

      expect(useCompletionPercentageMock).toHaveBeenCalledOnce();

      const [fields] = useCompletionPercentageMock.mock.calls[0] as unknown as [Ref<[]>];
      expect(fields.value).toStrictEqual([]);
    });
  });
});
