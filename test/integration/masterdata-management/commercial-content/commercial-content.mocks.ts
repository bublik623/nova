import { Page } from "@playwright/test";
import { mockRequest } from "../../utils/mockRequest";
import { hierarchicalGroups, highlights } from "./commercial-content.data";
import { ref } from "vue";
import { ExperienceMasterDataItem } from "@/composables/useExperienceMasterDataApi";

const experienceMasterDataURL = "http://localhost:8085";
const mockHighlights = ref(highlights);
const mockIncluded = ref<ExperienceMasterDataItem[]>([]);
const mockGroups = ref(hierarchicalGroups);

export default async function (p: Page) {
  await mockRequest(p, `${experienceMasterDataURL}/highlights?filters=language_code%3D%3Den`, "GET", {
    responseBody: highlights.filter((el) => el.language_code === "en"),
  });
  await mockRequest(p, `${experienceMasterDataURL}/hierarchical-groups?filters=language_code*`, "GET", {
    responseBody: mockGroups.value,
  });

  await p.route(
    `${experienceMasterDataURL}/highlights?filters=code%3D%3D*
  `,
    async (route, req) => {
      const requestUrl = req.url();
      const regex = /code%3D%3D([^&]*)/;
      const codeFilterMatch = regex.exec(requestUrl);

      if (req.method() === "GET") {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockHighlights.value.filter((el) => el.code === codeFilterMatch![1])),
        });
      }
    }
  );

  await p.route(`${experienceMasterDataURL}/highlights/*`, async (route, req) => {
    if (req.method() === "PUT") {
      const url = new URL(req.url());
      const id = url.pathname.split("/")[2];
      const reqBody = JSON.parse(req.postData() || "");

      const el = mockHighlights.value.find((el) => el.id === id);
      if (el) {
        el.name = reqBody.name;
      }

      await route.fulfill({
        status: 204,
      });
    }
  });

  await p.route(`${experienceMasterDataURL}/hierarchical-groups?filters=code*`, async (route, req) => {
    if (req.method() === "GET") {
      const requestUrl = req.url();
      const regex = /code%3D%3D([^&]*)/;
      const codeFilterMatch = regex.exec(requestUrl);

      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockGroups.value.filter((el) => el.code === codeFilterMatch![1])),
      });
    }
  });

  await p.route(`${experienceMasterDataURL}/hierarchical-groups`, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockGroups.value),
      });
    }

    if (req.method() === "POST") {
      const reqBody = JSON.parse(req.postData() || "");

      mockGroups.value.push({ ...reqBody, id: "12345" });

      await route.fulfill({
        status: 204,
      });
    }
  });

  await p.route(`${experienceMasterDataURL}/included`, async (route, req) => {
    if (req.method() === "POST") {
      const reqBody = JSON.parse(req.postData() || "");

      const _languages = [...reqBody.manual_languages, ...reqBody.automatic_languages];
      const items = reqBody.items;

      items.forEach((item: ExperienceMasterDataItem) => {
        mockIncluded.value.push(item);
      });

      await route.fulfill({
        status: 204,
      });
    }
  });

  await p.route(`${experienceMasterDataURL}/included?filters=language_code%3D%3Den`, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockIncluded.value.filter((el) => el.language_code === "en")),
      });
    }
  });

  await p.route(`${experienceMasterDataURL}/included?filters=code*`, async (route, req) => {
    if (req.method() === "GET") {
      const requestUrl = req.url();
      const regex = /code%3D%3D([^&]*)/;
      const codeFilterMatch = regex.exec(requestUrl);

      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockIncluded.value.filter((el) => el.code === codeFilterMatch![1])),
      });
    }
  });
}
