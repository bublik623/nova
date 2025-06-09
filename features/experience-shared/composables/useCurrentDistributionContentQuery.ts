import { useDistributionContentQuery } from "@/features/experience-raw/queries/distribution-content-query";
import { useRoute } from "vue-router";

export function useCurrentDistributionContentQuery() {
  const route = useRoute();
  const idRef = computed(() => route.params.id as string);

  return useDistributionContentQuery(idRef);
}
