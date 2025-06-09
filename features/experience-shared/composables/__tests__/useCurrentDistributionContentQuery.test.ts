import { describe, it, expect, vi, Mock } from "vitest";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useCurrentDistributionContentQuery } from "../useCurrentDistributionContentQuery";
import { useDistributionContentQuery } from "@/features/experience-raw/queries/distribution-content-query";

vi.mock("vue-router", () => ({
  useRoute: vi.fn(),
}));

vi.mock("@/features/experience-raw/queries/distribution-content-query", () => ({
  useDistributionContentQuery: vi.fn(),
}));

vi.mock("vue", () => ({
  computed: vi.fn(),
}));

describe("useCurrentDistributionContentQuery", () => {
  it("should call useDistributionContentQuery with the correct id", () => {
    const mockRoute = {
      params: {
        id: "123",
      },
    };
    (useRoute as Mock).mockReturnValue(mockRoute);

    (computed as Mock).mockReturnValue({
      value: "123",
    });

    useCurrentDistributionContentQuery();

    expect(useRoute).toHaveBeenCalled();
    expect(useDistributionContentQuery).toHaveBeenCalledWith({ value: "123" });
  });
});
