import { describe, it, expect, vi, Mock } from "vitest";
import { useCurrentExperienceFlow } from "./useCurrentExperienceFlow";
import { getExperienceFlowFromRoute } from "../utils/get-experience-flow-from-route";

vi.mock("../utils/get-experience-flow-from-route", () => ({
  getExperienceFlowFromRoute: vi.fn(),
}));

const mockRoute = { path: "/test-route" };

vi.stubGlobal("useRoute", () => mockRoute);

describe("useCurrentExperienceFlow", () => {
  it("should return the computed flow based on the route", () => {
    const mockFlow = "test-flow";

    (getExperienceFlowFromRoute as Mock).mockReturnValue(mockFlow);

    const flow = useCurrentExperienceFlow();

    expect(flow.value).toBe(mockFlow);
    expect(getExperienceFlowFromRoute).toHaveBeenCalledWith(mockRoute);
  });
});
