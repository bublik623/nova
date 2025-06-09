import { Page } from "@playwright/test";
import { mockMasterData } from "../utils/mockMasterData";
import { mockRequests } from "../utils/mockRequest";
import { experiences, options, overviewTimeSlots } from "@/test/integration/stop-sales/stop-sales.data";
import { inventoryServiceUrl } from "@/test/integration/experience/raw/experience-raw.mocks";

export const contentQueryURL = "http://localhost:8083";
export const experienceRawURL = "http://localhost:8084";
export const offerServiceURL = "http://localhost:8088";
export const inventoryServiceURL = "http://localhost:8089";

export default async function (p: Page) {
  // Mock Master Data
  await mockMasterData(p);

  // Mock Content Query
  await mockRequests(p, `${contentQueryURL}/v2/experience-raw-content*`, {
    GET: { responseBody: experiences },
  });

  // Mock Options Data
  await mockRequests(p, `${offerServiceURL}/options*`, {
    GET: { responseBody: options },
  });

  // Mock Time Slots
  await mockRequests(p, `${inventoryServiceURL}/slots*`, {
    GET: { responseBody: overviewTimeSlots },
  });

  await mockRequests(p, `${inventoryServiceUrl}/slots/**`, {
    POST: { responseBody: overviewTimeSlots },
  });
}
