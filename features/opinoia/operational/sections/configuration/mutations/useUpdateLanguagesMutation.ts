import { useMutation } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { LanguageOption } from "@/features/experience-calendar/components/OptionLanguagesDropdown.vue";

export function useUpdateLanguagesMutation(experienceId: Readonly<Ref<string>>) {
  const { updateExperienceLanguages } = useOfferServiceApi();
  const queryClient = useQueryClient();

  async function updateLanguages(languages: LanguageOption[]) {
    const languagesArray = languages.map((lang) => lang.val);
    await updateExperienceLanguages({ experience_id: experienceId.value!, languages: languagesArray });
  }

  return useMutation({
    mutationKey: ["offer-experience-languages-mutation", experienceId],
    mutationFn: (languages: LanguageOption[]) => updateLanguages(languages),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experience-languages", experienceId] }),
  });
}
