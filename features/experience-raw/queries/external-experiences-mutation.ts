import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { useQueryClient, useMutation } from "@tanstack/vue-query";
import { EXTERNAL_LINKED_EXPERIENCE_QUERY_KEY } from "./external-experiences-query";

const EXTERNAL_LINKED_EXPERIENCE_MUTATION_KEY = "external-linked-experience-mutation-key";
export const EXTERNAL_LINKED_EXPERIENCE_MUTATION_KEY_LINK = `${EXTERNAL_LINKED_EXPERIENCE_MUTATION_KEY}-link`;
export const EXTERNAL_LINKED_EXPERIENCE_MUTATION_KEY_UNLINK = `${EXTERNAL_LINKED_EXPERIENCE_MUTATION_KEY}-unlink`;

export function useExternalLinkedExperienceMutation() {
  const { linkExternalExperience, unlinkExternalExperience } = useExperienceRawApi();
  const queryClient = useQueryClient();

  const link = useMutation({
    mutationKey: [EXTERNAL_LINKED_EXPERIENCE_MUTATION_KEY_LINK],
    mutationFn: async (opt: {
      eventId: string;
      experienceId: string;
      experienceRefCode: string;
      previousLinkToRemove?: string;
    }) => {
      await linkExternalExperience(opt.eventId, {
        experience_id: opt.experienceId,
        reference_code: opt.experienceRefCode,
        previous_link_id_to_remove: opt.previousLinkToRemove ?? undefined,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [EXTERNAL_LINKED_EXPERIENCE_QUERY_KEY] });
    },
  });

  const unlink = useMutation({
    mutationKey: [EXTERNAL_LINKED_EXPERIENCE_MUTATION_KEY_UNLINK],
    mutationFn: async (opt: { eventId: string }) => {
      await unlinkExternalExperience(opt.eventId);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [EXTERNAL_LINKED_EXPERIENCE_QUERY_KEY] });
    },
  });

  return { link, unlink };
}
