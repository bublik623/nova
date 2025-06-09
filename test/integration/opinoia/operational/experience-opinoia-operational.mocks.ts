import { Page } from "@playwright/test";
import { offerServiceURL } from "../../utils/mockOfferService";
import { mockRequests } from "../../utils/mockRequest";
import { offerServiceExperience, mockDistributionContent } from "./experience-opinoia-operational.data";
import { experienceRawURL } from "../../experience/raw/experience-raw.mocks";

export default async function (p: Page) {
  await mockRequests(p, `${offerServiceURL}/experiences/*`, {
    GET: {
      responseBody: offerServiceExperience,
    },
  });

  await mockRequests(p, `${experienceRawURL}/distribution-content/*`, {
    GET: { responseBody: mockDistributionContent },
  });
}
