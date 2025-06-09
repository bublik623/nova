import { Page } from "@playwright/test";
import { mockMasterData } from "../../utils/mockMasterData";
import { mockRequests } from "../../utils/mockRequest";
import { contentQueryData, mockDamService } from "./experience-media.data";
import { mockBookingInfo } from "../raw/customer-info/customer-info.data";
import { mockDistributionContentWithSupplierId, mockTranslationSnapshotData } from "../raw/experience-raw.data";
import { experienceRawURL } from "../raw/experience-raw.mocks";

const contentCommandURL = "http://localhost:8081";
const contentQueryURL = "http://localhost:8083";
const damServiceUrl = "http://localhost:8093";
export const metadataURL = "http://localhost:8086";

let increment = 1;

export default async function (p: Page) {
  // Mock Master Data
  await mockMasterData(p);

  // Mock Content Command
  await mockRequests(p, `${contentQueryURL}/distribution-content/*`, {
    GET: { responseBody: contentQueryData },
  });

  await mockRequests(p, `${experienceRawURL}/distribution-content/*`, {
    GET: { responseBody: mockDistributionContentWithSupplierId },
    PUT: { responseBody: "" },
  });

  await mockRequests(p, `${contentCommandURL}/experience-media/*`, { PUT: {} });
  await mockRequests(p, `${contentCommandURL}v2/images/*`, { DELETE: {} });

  await mockRequests(p, `${metadataURL}/experience-booking-information*`, {
    GET: {
      responseBody: mockBookingInfo,
    },
  });

  await mockRequests(p, `${experienceRawURL}/snapshot*`, {
    GET: { responseBody: [mockTranslationSnapshotData] },
  });

  await mockRequests(p, `${experienceRawURL}/media-snapshot*`, {
    GET: { responseBody: [mockTranslationSnapshotData] },
  });

  //mock DAM service
  await mockRequests(p, `${damServiceUrl}/experiences/experience-1/images`, {
    GET: { responseBody: mockDamService },
  });

  // Mock Image Upload
  await p.route(`${contentCommandURL}/v2/images`, async (route, req) => {
    if (req.method().toLowerCase() === "post") {
      await route.fulfill({
        status: 201,
        headers: {
          location: `/images/img-${increment}`,
          "Access-Control-Expose-Headers": "*",
        },
      });
      increment++;
    } else {
      await route.continue();
    }
  });
}
