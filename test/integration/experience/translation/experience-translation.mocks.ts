import { Page } from "@playwright/test";
import { mockMasterData } from "../../utils/mockMasterData";
import { mockRequest, mockRequests } from "../../utils/mockRequest";
import { translations, experienceMetadata, customOptions, offerServiceExperience } from "./experience-translation.data";
import { mockExperienceBookingQuestions } from "../options/customer-details/customer-details.data";
import { experienceRawURL } from "@/test/integration/dashboard/dashboard.mocks";
import {
  mockDistributionContentWithSupplierId,
  mockRawSnapshot,
  mockTranslationSnapshotData,
  rawContentProductTypeNova,
} from "@/test/integration/experience/raw/experience-raw.data";
import { translationSnapshotMock } from "../revision/translation/translation-revision.data";

const contentCommandURL = "http://localhost:8081";
const metadataURL = "http://localhost:8086";
const offerServiceURL = "http://localhost:8088";

export default async function (p: Page) {
  // Mock Master Data
  await mockMasterData(p);

  // Mock Content Command
  await mockRequest(p, /.*translations.*language_code=en/, "GET", {
    responseBody: [translations.en],
  });
  await mockRequest(p, /.*translations.*language_code=es/, "GET", {
    responseBody: [translations.es],
  });
  await mockRequest(p, `${contentCommandURL}/custom-*`, "GET", {
    responseBody: customOptions,
  });

  // Mock Meta Data
  await mockRequest(p, `${metadataURL}/experience-highlights*`, "GET", {
    responseBody: [experienceMetadata.highlights],
  });
  await mockRequest(p, `${metadataURL}/experience-included*`, "GET", {
    responseBody: [experienceMetadata.included],
  });
  await mockRequest(p, `${metadataURL}/experience-non-included*`, "GET", {
    responseBody: [experienceMetadata.nonIncluded],
  });
  await mockRequest(p, `${metadataURL}/experience-important*`, "GET", {
    responseBody: [experienceMetadata.importantInfo],
  });
  await mockRequest(p, `${metadataURL}/experience-additional*`, "GET", {
    responseBody: experienceMetadata.additionalServices,
  });
  await mockRequest(p, `${metadataURL}/experience-categories*`, "GET", {
    responseBody: experienceMetadata.categories,
  });
  await mockRequest(p, `${metadataURL}/experience-interests*`, "GET", {
    responseBody: experienceMetadata.interests,
  });

  await mockRequest(p, `${metadataURL}/experience-booking-questions*`, "GET", {
    responseBody: [mockExperienceBookingQuestions],
  });

  await mockRequest(p, `${metadataURL}/experience-markets*`, "GET", {
    responseBody: [],
  });

  await mockRequest(p, /experience-.*\/id.*/, "PUT");

  //mock distribution content for supplierId
  await mockRequests(p, `${experienceRawURL}/distribution-content/*`, {
    GET: { responseBody: mockDistributionContentWithSupplierId },
    PUT: { responseBody: "" },
  });
  await mockRequests(p, `${experienceRawURL}/raw-snapshot*`, {
    GET: { responseBody: [mockRawSnapshot] },
  });

  // Mock for getAllTranslationSnapshots
  await mockRequests(p, new RegExp(`${experienceRawURL}/snapshot\\?.*sort=-creationDate`), {
    GET: { responseBody: [mockTranslationSnapshotData] },
  });

  // Mock for getLastTwoSnapshots
  await mockRequests(p, new RegExp(`${experienceRawURL}/snapshot\\?.*limit=2`), {
    GET: { responseBody: [mockTranslationSnapshotData, mockTranslationSnapshotData] },
  });

  await mockRequests(p, `${experienceRawURL}/v2/experience-raw*`, {
    GET: { responseBody: [rawContentProductTypeNova] },
  });

  await mockRequests(p, `${experienceRawURL}/translation-snapshot*`, {
    GET: { responseBody: [translationSnapshotMock[0]] },
  });

  // Mock Offer Service
  await p.route(`${offerServiceURL}/experiences/*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(offerServiceExperience),
        });
        break;

      case "PUT":
        await route.fulfill({
          status: 204,
        });
        break;

      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });
}
