import { mockMasterData } from "@/test/integration/utils/mockMasterData";
import { Page } from "@playwright/test";
import { mockRequests } from "@/test/integration/utils/mockRequest";
import {
  mockTranslationRevision2,
  mockMasterLanguageRevision2,
  mockDistributionData,
  mockTranslationRevision1,
  mockMasterLanguageRevision1,
  mockASXTranslationRevision,
  mockASXMasterLanguageRevision,
  mockASXDistributionData,
  translationSnapshotMock,
} from "./translation-revision.data";
import { integrationBaseURL } from "@/playwright.config";
import { ExperienceSource } from "@/types/generated/ExperienceRawServiceApi";
export const translationLanguage = "es";

export const settingsURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/translation/${translationLanguage}/settings`;
export const locationURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/translation/${translationLanguage}/location`;
export const contentSegmentationURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/translation/${translationLanguage}/content-segmentation`;
export const customerInfoURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/translation/${translationLanguage}/customer-info`;
export const asterixIntegrationURL = `${integrationBaseURL}/experience/$expId/revision/$revisionId/translation/${translationLanguage}/asterix-integration`;

export const experienceRawURL = "http://localhost:8084";

export async function mockApi(page: Page, experienceSource: ExperienceSource) {
  await mockMasterData(page);

  if (experienceSource === "ASX") {
    await mockRequests(page, `${experienceRawURL}/snapshot/$revisionId`, {
      GET: { responseBody: mockASXTranslationRevision },
    });

    await mockRequests(page, `${experienceRawURL}/snapshot/test-id-en-1`, {
      GET: { responseBody: mockASXMasterLanguageRevision },
    });

    await mockRequests(page, new RegExp(`^${experienceRawURL}/snapshot\\?filters=experience_id.*`), {
      GET: {
        responseBody: [mockASXTranslationRevision, mockASXMasterLanguageRevision],
      },
    });

    await mockRequests(page, `${experienceRawURL}/distribution-content/*`, {
      GET: { responseBody: mockASXDistributionData },
    });
  } else {
    await mockRequests(page, `${experienceRawURL}/snapshot/$revisionId`, {
      GET: { responseBody: mockTranslationRevision2 },
    });

    await mockRequests(page, `${experienceRawURL}/snapshot/test-id-en-2`, {
      GET: { responseBody: mockMasterLanguageRevision2 },
    });

    await mockRequests(page, `${experienceRawURL}/snapshot/test-id-es-1`, {
      GET: { responseBody: mockTranslationRevision1 },
    });

    await mockRequests(page, `${experienceRawURL}/translation-snapshot*`, {
      GET: { responseBody: translationSnapshotMock },
    });

    await mockRequests(page, `${experienceRawURL}/snapshot/test-id-en-1`, {
      GET: { responseBody: mockMasterLanguageRevision1 },
    });

    await mockRequests(page, new RegExp(`^${experienceRawURL}/snapshot\\?filters=experience_id.*`), {
      GET: {
        responseBody: [
          mockTranslationRevision2,
          mockMasterLanguageRevision2,
          mockTranslationRevision1,
          mockMasterLanguageRevision1,
        ],
      },
    });

    await mockRequests(page, `${experienceRawURL}/distribution-content/*`, {
      GET: { responseBody: mockDistributionData },
    });
  }
}
