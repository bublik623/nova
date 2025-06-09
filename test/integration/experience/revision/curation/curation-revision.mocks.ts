import { mockMasterData } from "@/test/integration/utils/mockMasterData";
import { Page } from "@playwright/test";
import { mockRequests } from "@/test/integration/utils/mockRequest";
import {
  mockAsxCurationRevision,
  mockAsxDistributionData,
  mockAsxModalities,
  mockAsxServices,
  mockCurationRevision,
  mockDistributionData,
} from "./curation-revision.data";
import { integrationBaseURL } from "@/playwright.config";

export const settingsURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/curation/settings`;
export const locationURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/curation/location`;
export const contentSegmentationURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/curation/content-segmentation`;
export const customerInfoURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/curation/customer-info`;
export const asterixIntegrationURL = `${integrationBaseURL}/experience/$asxExpId/revision/$asxRevisionId/curation/asterix-integration`;

export const experienceRawURL = "http://localhost:8084";

export async function mockApi(page: Page) {
  await mockMasterData(page);

  await mockRequests(page, `${experienceRawURL}/snapshot/$revisionId`, {
    GET: { responseBody: mockCurationRevision },
  });

  await mockRequests(page, `${experienceRawURL}/distribution-content/$expId`, {
    GET: { responseBody: mockDistributionData },
  });

  await mockRequests(page, `${experienceRawURL}/snapshot/$asxRevisionId`, {
    GET: { responseBody: mockAsxCurationRevision },
  });

  await mockRequests(page, `${experienceRawURL}/distribution-content/$asxExpId`, {
    GET: { responseBody: mockAsxDistributionData },
  });

  await mockRequests(page, `${experienceRawURL}/asx/experiences?contain=SVC-001&offset=0&limit=100`, {
    GET: { responseBody: mockAsxServices },
  });

  await mockRequests(page, `${experienceRawURL}/asx/experiences/SVC-001/modalities?offset=0&limit=100`, {
    GET: { responseBody: mockAsxModalities },
  });
}
