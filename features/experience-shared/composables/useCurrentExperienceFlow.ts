import { getExperienceFlowFromRoute } from "../utils/get-experience-flow-from-route";

export function useCurrentExperienceFlow() {
  const route = useRoute();

  const flow = computed(() => getExperienceFlowFromRoute(route));

  return flow;
}
