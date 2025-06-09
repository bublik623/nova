import { useExperienceRawQuery } from "../queries/experience-raw-query";
import { useRoute } from "vue-router";

export function useCurrentRawExperienceQuery() {
  const route = useRoute();
  const idRef = computed(() => route.params.id as string);

  const experienceRawQuery = useExperienceRawQuery(idRef);

  return experienceRawQuery;
}
