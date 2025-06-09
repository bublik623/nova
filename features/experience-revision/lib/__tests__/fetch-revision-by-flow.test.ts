import {
  mapMediaSnapshotValues,
  mapRawSnapshotValues,
  mapSnapshotValues,
} from "@/features/experience-revision/lib/map-values";
import { fetchRevisionByFlow } from "@/features/experience-revision/lib/fetch-revision-by-flow";
import { afterEach, describe, expect, test, vi } from "vitest";

const mockDistributionData = {
  creation_date: "2024-06-20T05:03:11.079Z",
  updated_date: "2024-07-19T06:56:05.154Z",
  id: "182368a2-2879-4a43-b5f7-94fdc3e59641",
  reference_code: "EXP0016118",
  supplier_id: "082d65c7-3d18-484b-9dc5-6e33ef73be49",
  media_content: { id: "f1ea3518-47dd-4559-bc78-6a0147963bc8", distribution_status: "NOT_READY" },
  translation_content_list: [
    { id: "d6d6dd71-5914-407b-91d4-f1aaa743e7ee", language_code: "es", distribution_status: "READY" },
    { id: "80f4b554-2572-40de-8101-73b0cc3f03cd", language_code: "en", distribution_status: "NOT_READY" },
    { id: "0fcfe9cd-5b32-4e49-bc93-77e14a9a4c77", language_code: "it", distribution_status: "NOT_READY" },
    { id: "75d1e590-2c57-46bf-82e2-7d90c2313f12", language_code: "de", distribution_status: "NOT_READY" },
    { id: "3c688577-370c-4f6e-99e2-600ebf30377e", language_code: "fr", distribution_status: "NOT_READY" },
    { id: "b7ec8df9-aae3-4ecf-ae0e-5e923e352c45", language_code: "nl", distribution_status: "NOT_READY" },
    { id: "9e3492b6-a207-4166-b1c9-c4e541569e14", language_code: "pl", distribution_status: "NOT_READY" },
    { id: "5fe5b738-b873-42bc-b62e-b4824479fe59", language_code: "pt", distribution_status: "NOT_READY" },
    { id: "55521d3a-9c3a-48d6-a326-5e9f4cfae557", language_code: "ru", distribution_status: "NOT_READY" },
    { id: "e4302e37-cdef-444b-8ba4-e5f6c1090639", language_code: "dk", distribution_status: "NOT_READY" },
    { id: "20a1f7fa-964a-4637-bc0e-55dde4be87a1", language_code: "no", distribution_status: "NOT_READY" },
    { id: "dc3c208a-7dfa-45b2-8df3-a20a5954fcd6", language_code: "fi", distribution_status: "NOT_READY" },
    { id: "2a94e87d-290c-4dc9-b6c7-7e920df14c1e", language_code: "se", distribution_status: "NOT_READY" },
  ],
  global_status: "NOT_READY",
  curation_level: "DEDICATED",
  priority: 8,
  imported: false,
};

const mockSnapshotData = { data: { test: "test" } };

const useExperienceRawApiMock = {
  getSingleRawSnapshot: vi.fn(() => Promise.resolve({ data: mockSnapshotData })),
  getDistributionContent: vi.fn(() => Promise.resolve({ data: mockDistributionData })),
  getSingleSnapshot: vi.fn(() => Promise.resolve({ data: mockSnapshotData })),
};

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => useExperienceRawApiMock,
}));

vi.mock("@/features/experience-revision/lib/map-values");

describe("fetchRevisionByFlow", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const revisionId = "123";
  const experienceId = "456";

  test("should call getSingleRawSnapshot and mapRawValues when flow is 'raw'", async () => {
    const language = "en";
    const flow = "raw";

    await fetchRevisionByFlow(language, flow, revisionId, experienceId);

    expect(useExperienceRawApiMock.getSingleRawSnapshot).toHaveBeenCalledWith(revisionId);
    expect(mapRawSnapshotValues).toHaveBeenCalledWith(mockSnapshotData, mockDistributionData);
  });

  test("should call getSingleSnapshot and mapCurationValues when flow is 'curation'", async () => {
    const language = "en";
    const flow = "curation";

    await fetchRevisionByFlow(language, flow, revisionId, experienceId);

    expect(useExperienceRawApiMock.getSingleSnapshot).toHaveBeenCalledWith(revisionId);
    expect(mapSnapshotValues).toHaveBeenCalledWith(flow, language, mockSnapshotData, mockDistributionData);
  });

  test('should handle translation flow when flow is "translation"', async () => {
    const language = "fr";
    const flow = "translation";

    await fetchRevisionByFlow(language, flow, revisionId, experienceId);

    expect(useExperienceRawApiMock.getSingleSnapshot).toHaveBeenCalledWith(revisionId);
    expect(mapSnapshotValues).toHaveBeenCalledWith(flow, language, mockSnapshotData, mockDistributionData);
  });

  test('should handle media flow when flow is "media"', async () => {
    const language = "en";
    const flow = "media";

    await fetchRevisionByFlow(language, flow, revisionId, experienceId);

    expect(useExperienceRawApiMock.getSingleSnapshot).toHaveBeenCalledWith(revisionId);
    expect(mapMediaSnapshotValues).toHaveBeenCalledWith(mockSnapshotData);
  });

  test("should throw an error for invalid flow", async () => {
    const language = "en";
    const flow = "invalid";
    const revisionId = "123";
    const experienceId = "456";

    await expect(
      fetchRevisionByFlow(language, flow, revisionId, experienceId)
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Could not fetch revision for flow: invalid]`);
  });
});
