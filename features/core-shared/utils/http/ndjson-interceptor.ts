import { AxiosResponse } from "axios";
import { parseNDJSON } from "@/utils/parse-ndjson";

export function ndjsonInterceptor(response: AxiosResponse) {
  if (response.headers["content-type"] === "application/x-ndjson") {
    const parsedData = parseNDJSON(response.data);
    return { ...response, data: parsedData };
  } else {
    return response;
  }
}
