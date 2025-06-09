import { describe, it, expect, vi, Mock } from "vitest";
import { useExperienceRawQuery } from "../../queries/experience-raw-query";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useCurrentRawExperienceQuery } from "../useCurrentRawExperienceQuery";

vi.mock("vue-router", () => ({
  useRoute: vi.fn(),
}));

vi.mock("../../queries/experience-raw-query", () => ({
  useExperienceRawQuery: vi.fn(),
}));

vi.mock("vue", () => ({
  computed: vi.fn(),
}));

describe("useCurrentExperienceRawQuery", () => {
  it("should call useExperienceRawQuery with the correct id", () => {
    const mockRoute = {
      params: {
        id: "123",
      },
    };
    (useRoute as Mock).mockReturnValue(mockRoute);

    (computed as Mock).mockReturnValue({
      value: "123",
    });

    useCurrentRawExperienceQuery();

    expect(useRoute).toHaveBeenCalled();
    expect(useExperienceRawQuery).toHaveBeenCalledWith({ value: "123" });
  });
});
