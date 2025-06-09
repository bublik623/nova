import { Page } from "@playwright/test";
import { mockRequest } from "../../utils/mockRequest";
import {
  rawSearchHitsWithNoQuery,
  rawSearchHitsWithQuery,
  createNthRawPage,
  rawResultsWithFilters,
  reportFileName,
  reportFileContent,
} from "./advanced-search.raw.data";
import { mockMasterData } from "../../utils/mockMasterData";

export const contentQueryBaseURL = "http://localhost:8083";
export const masterDataBaseURL = "http://localhost:8095";

export default async function (page: Page) {
  await mockRequest(page, `${contentQueryBaseURL}/experience-raw-content/report*`, "POST", undefined, () => {
    return {
      headers: { "content-disposition": `form-data; name="attachment"; filename="${reportFileName}"` },
      body: reportFileContent,
    };
  });

  await mockRequest(page, `${contentQueryBaseURL}/experience-raw-content*`, "GET", undefined, (request) => {
    const urlParts = request.url().split("?");
    const querystring = toMap(urlParts[1]);
    const hasQuery = querystring.get("query")?.length;
    const hasFilters = querystring.get("filters")?.length;

    let body;
    if (hasQuery) {
      body = rawSearchHitsWithQuery;
    } else if (hasFilters) {
      body = rawResultsWithFilters;
    } else {
      body = rawSearchHitsWithNoQuery;
    }

    if (querystring.get("offset") !== "0" && querystring.get("limit") !== "0") {
      body = createNthRawPage(+querystring.get("offset")! / +querystring.get("limit")! + 1);
    }

    return { body, headers: { "total-counts": "1000" } };
  });

  await mockMasterData(page);
}

function toMap(querystring: string): Map<string, string> {
  const result = new Map();

  querystring.split("&").forEach((param) => {
    const keyValue = param.split("=");
    result.set(keyValue[0], keyValue[1]);
  });

  return result;
}
