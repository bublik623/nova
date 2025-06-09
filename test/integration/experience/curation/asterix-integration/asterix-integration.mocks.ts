import { Page } from "@playwright/test";
import mockApi from "../experience-curation.mocks";
import { mockRequests } from "@/test/integration/utils/mockRequest";
import {
  asterixModalities,
  asterixServices,
  modalitiesTranslations,
  serviceCodeTranslations,
} from "./asterix-integration.data";

const contentCommandURL = "http://localhost:8081";
const experienceRawURL = "http://localhost:8084";

export default async function (page: Page) {
  await mockApi(page, "ASX");

  // mock translations endpoints
  await mockRequests(page, `${contentCommandURL}/service-code-translations*`, {
    GET: { responseBody: serviceCodeTranslations },
  });
  await mockRequests(page, `${contentCommandURL}/option-translations*`, {
    GET: { responseBody: modalitiesTranslations },
  });

  // mock original titles from asx endpoints
  await mockRequests(page, `${experienceRawURL}/asx/experiences*`, {
    GET: { responseBody: asterixServices },
  });
  await mockRequests(page, `${experienceRawURL}/asx/experiences/*/modalities*`, {
    GET: { responseBody: asterixModalities },
  });
}
