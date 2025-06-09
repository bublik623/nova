import { DocumentContentType } from "@/types/DocumentStatuses";
import { hasPermission } from "@/features/roles/lib/has-permission";

export function useExperienceDashboardView() {
  const canUserReadRaw = hasPermission("experience.raw.canRead");
  const canUserReadEditorial = [
    hasPermission("experience.curation.canRead"),
    hasPermission("experience.media.canRead"),
    hasPermission("experience.translation.canRead"),
  ].some((permission) => permission);

  const canUserToggleView = computed(() => canUserReadRaw && canUserReadEditorial);

  const shouldHaveRawContent = computed(() => canUserReadRaw && !canUserReadEditorial);
  const shouldHaveEditorialContent = computed(() => canUserReadEditorial && !canUserReadRaw);

  const getInitialContentForView = computed((): DocumentContentType => {
    if (shouldHaveRawContent.value) {
      return DocumentContentType.RAW;
    }

    if (shouldHaveEditorialContent.value) {
      return DocumentContentType.EDITORIAL;
    }

    return DocumentContentType.RAW;
  });

  return {
    canUserToggleView,
    shouldHaveRawContent,
    shouldHaveEditorialContent,
    getInitialContentForView,
  };
}
