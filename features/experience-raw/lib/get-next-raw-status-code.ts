import { StatusCode } from "@/types/generated/ExperienceRawServiceApi";

export function getNextRawStatusCode(currentStatusCode: StatusCode, publish: boolean): StatusCode | null {
  if (publish) {
    return "SENT_TO_REVIEW";
  }

  if (currentStatusCode === "UP_TO_DATE" || currentStatusCode === "SENT_TO_REVIEW") {
    return "IN_REVIEW";
  }

  return null;
}
