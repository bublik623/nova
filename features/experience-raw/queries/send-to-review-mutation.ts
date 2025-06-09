import { RawElement } from "@/types/generated/ExperienceRawServiceApi";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { RAW_EXPERIENCE_QUERY_KEY } from "./experience-raw-query";

export function useSendToReviewMutation() {
  const { sendToReview } = useExperienceRawApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rawId: RawElement["id"]) => {
      if (!rawId) throw new Error("Raw ID is missing");

      await sendToReview(rawId);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [RAW_EXPERIENCE_QUERY_KEY],
      });
    },
  });
}
