import { mockMasterData } from "@/test/integration/utils/mockMasterData";
import { Page } from "@playwright/test";
import { mockRequests } from "@/test/integration/utils/mockRequest";
import { mockCurationRevision, mockDistributionData } from "./media-revision.data";
import { integrationBaseURL } from "@/playwright.config";

export const visualsURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/media/visuals`;
export const experienceRawURL = "http://localhost:8084";

export async function mockApi(page: Page) {
  await mockMasterData(page);

  await mockRequests(page, `${experienceRawURL}/snapshot/*`, {
    GET: { responseBody: mockCurationRevision },
  });

  await mockRequests(page, `${experienceRawURL}/distribution-content/*`, {
    GET: { responseBody: mockDistributionData },
  });
}
