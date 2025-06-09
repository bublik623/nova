import { Page } from "@playwright/test";
import { mockMasterData } from "../utils/mockMasterData";
import { mockOfferService } from "../utils/mockOfferService";
import { mockRequest, mockRequests } from "../utils/mockRequest";
import { rawData, contentData, distributionContentData } from "./dashboard.data";

export const contentQueryURL = "http://localhost:8083";
export const experienceRawURL = "http://localhost:8084";

export default async function (p: Page) {
  // Mock Master Data
  await mockMasterData(p);
  await mockOfferService(p);

  // Mock Content Query
  await mockRequest(p, `${contentQueryURL}/v2/experience-raw-content*`, "GET", {
    responseBody: rawData,
  });
  await mockRequest(p, `${contentQueryURL}/experience-raw-content*`, "GET", {
    responseBody: rawData,
  });
  await mockRequest(p, `${contentQueryURL}/experience-content*`, "GET", {
    responseBody: contentData,
  });

  /**
   * This mock was messing with the loading of a typescript file (experience-content-query.ts) and as a result it was breaking the tests.
   * To solve it, a negative lookahead has been added to the regex, so that it do not match any url that contains `.ts` in it after the `distribution-content` part.
   */
  await mockRequests(p, /distribution-content(?!.*\.ts$)/, {
    GET: { responseBody: distributionContentData },
    PUT: {},
    POST: {
      headers: { location: "/location/new-experience-id" },
    },
    DELETE: {},
  });

  await mockRequest(p, /.*experience-content.*language_code%3D%3Den.*/, "GET", {
    responseBody: contentData.filter((d) => d.language_code === "en"),
  });
  await mockRequest(p, /.*experience-content.*language_code!%3Den.*/, "GET", {
    responseBody: contentData.filter((d) => d.language_code !== "en"),
  });

  // Mock Experience Raw
  await mockRequest(p, `${experienceRawURL}/experience-raw`, "POST", {
    headers: {
      location: "/location/new-experience-id",
    },
  });

  await mockRequest(p, `${experienceRawURL}/v2/experience-raw/*`, "DELETE");
  await mockRequests(p, `${experienceRawURL}/v2/experience-raw*`, {
    POST: {
      headers: { location: "/location/new-experience-id" },
    },
  });
}
