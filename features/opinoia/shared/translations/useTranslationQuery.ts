import { useQuery } from "@tanstack/vue-query";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { AvailableLanguage } from "@/types/Language";
import { useContentCommandApi } from "@/composables/useContentCommandApi";

export function useTranslationQuery(
  experienceId: Readonly<Ref<string>>,
  languageCode: Readonly<Ref<AvailableLanguage>>
) {
  const { getTranslations } = useContentCommandApi();

  return useQuery({
    queryKey: ["translation", experienceId, languageCode],
    queryFn: () => {
      const params = { filters: emit(builder.eq("experience_id", experienceId.value)) };
      return getTranslations("experience-translations", { params: { ...params, language_code: languageCode.value } });
    },
    select: (response) => response.data[0],
  });
}
