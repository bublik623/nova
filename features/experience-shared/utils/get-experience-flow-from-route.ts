import { DocumentContentType, DocumentContentTypeSchema } from "@/types/DocumentStatuses";
import { RouteLocationNormalizedGeneric } from "vue-router";

export function getExperienceFlowFromRoute(
  routeLocation: RouteLocationNormalizedGeneric
): DocumentContentType | undefined {
  const paramFlow = routeLocation.params?.flow;

  // checking the flow  param for the revision flow
  if (paramFlow && typeof paramFlow === "string") {
    const normalizedFlow = paramFlow.toLowerCase();
    const result = DocumentContentTypeSchema.safeParse(normalizedFlow);
    if (result.success) {
      return result.data;
    }
  }

  const routeName = routeLocation.name?.toString();
  if (!routeName) return undefined;

  const mappings: { substring: string; flow: DocumentContentType }[] = [
    { substring: "experience-id-raw", flow: DocumentContentType.RAW },
    { substring: "experience-id-curation", flow: DocumentContentType.EDITORIAL },
    { substring: "experience-id-translation", flow: DocumentContentType.TRANSLATION },
    { substring: "experience-id-media", flow: DocumentContentType.MEDIA },
  ];

  const mapping = mappings.find(({ substring }) => routeName.includes(substring));
  return mapping ? mapping.flow : undefined;
}
