import { mockMasterData } from "@/test/integration/utils/mockMasterData";
import { Page } from "@playwright/test";
import { mockRequests } from "@/test/integration/utils/mockRequest";
import {
  mockRawRevision,
  mockDistributionData,
  mockAsxRawRevision,
  mockAsxDistributionData,
  mockAsxServices,
  mockAsxModalities,
} from "./raw-revision.data";
import { integrationBaseURL } from "@/playwright.config";
export const settingsURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/raw/settings`;
export const locationURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/raw/location`;
export const contentSegmentationURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/raw/content-segmentation`;
export const customerInfoURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/raw/customer-info`;
export const asterixIntegrationURL = `${integrationBaseURL}/experience/$asxExpId/revision/$asxRevisionId/raw/asterix-integration`;

export const experienceRawURL = "http://localhost:8084";

export async function mockApi(page: Page) {
  await mockMasterData(page);

  await mockRequests(page, `${experienceRawURL}/raw-snapshot/$revisionId`, {
    GET: { responseBody: mockRawRevision },
  });

  await mockRequests(page, `${experienceRawURL}/distribution-content/$expId`, {
    GET: { responseBody: mockDistributionData },
  });

  await mockRequests(page, `${experienceRawURL}/raw-snapshot/$asxRevisionId`, {
    GET: { responseBody: mockAsxRawRevision },
  });

  await mockRequests(page, `${experienceRawURL}/distribution-content/$asxExpId`, {
    GET: { responseBody: mockAsxDistributionData },
  });

  await mockRequests(page, `${experienceRawURL}/asx/experiences?contain=SVC-001&offset=0&limit=50`, {
    GET: { responseBody: mockAsxServices },
  });

  await mockRequests(page, `${experienceRawURL}/asx/experiences/SVC-001/modalities?offset=0&limit=100`, {
    GET: { responseBody: mockAsxModalities },
  });
}
