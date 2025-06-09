import { useQuery } from "@tanstack/vue-query";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";

export const EXTERNAL_EXPERIENCES_QUERY_KEY = "external-experiences-query-key";

export function useExternalExperiencesQuery(supplierIdRef: Ref<string | undefined>) {
  const { getExternalExperiences } = useExperienceRawApi();

  return useQuery({
    queryKey: [EXTERNAL_EXPERIENCES_QUERY_KEY],
    queryFn: () => {
      if (supplierIdRef.value == null) {
        throw new Error("Supplier ID is required");
      }
      return getExternalExperiences(supplierIdRef.value);
    },
    select: ({ data }) => data,
    enabled: false,
  });
}

export const EXTERNAL_LINKED_EXPERIENCE_QUERY_KEY = "external-linked-experience-query-key";

export function useExternalLinkedExperienceQuery(experienceIdRef: Ref<string | undefined>, enabled: Ref<boolean>) {
  const { getLinkedExternalExperience } = useExperienceRawApi();
  return useQuery({
    queryKey: [EXTERNAL_LINKED_EXPERIENCE_QUERY_KEY, experienceIdRef],
    queryFn: () => {
      if (experienceIdRef.value == null) {
        throw new Error("Experience ID is required");
      }

      return getLinkedExternalExperience(experienceIdRef.value);
    },
    select: ({ data }) => data[0],
    enabled,
  });
}
