import { queryContent } from "@/features/experience-dashboard/lib/dashboard.constants";
import { DocumentContentType } from "@/types/DocumentStatuses";

export const getDashboardUrl = () => {
  const route = useRoute();
  const router = useRouter();
  const currentRoutePath = computed(() => route.name as string);
  let contentType: string | undefined;

  if (!currentRoutePath.value) {
    return router.resolve("/");
  }

  // we are on raw exp page
  if (currentRoutePath.value.includes("experience-id-raw")) {
    contentType = DocumentContentType.RAW;
  }
  // we are on curation or translation page
  if (currentRoutePath.value.match(/(curation)|(translation)/g)) {
    contentType = DocumentContentType.EDITORIAL;
  }
  return router.resolve({
    path: `/`,
    query: { [queryContent]: contentType },
  });
};
