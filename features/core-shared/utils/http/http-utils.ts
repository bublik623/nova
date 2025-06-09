import { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";

export function getIdFromLocation(location?: string) {
  const locationUrlSegments = location?.split("/") || [];
  const id = locationUrlSegments.pop();
  return id;
}

export function getFileNameFromContentDisposition(headers: RawAxiosResponseHeaders | AxiosResponseHeaders) {
  let fileName = undefined;
  const fileNameMatch = headers["content-disposition"]?.match(/filename="(.+)"/);

  if (fileNameMatch?.length === 2) {
    fileName = fileNameMatch[1];
  }

  return fileName;
}
