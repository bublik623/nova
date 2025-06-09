import { ExperienceFlowCode } from "@/types/DocumentStatuses";

export function getSelectedCodesFromUrl(url: string): ExperienceFlowCode[] {
  switch (true) {
    case url.includes("raw"):
      return ["BASE"];
    case url.includes("curation"):
      return ["CURATION"];
    case url.includes("media"):
      return ["MEDIA"];
    case url.includes("translation"):
      return ["AUTOTRANSLATION", "MANUAL_TRANSLATION"];
    default:
      return [];
  }
}
