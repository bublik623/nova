import { ExperienceTranslation } from "@/types/generated/ContentCommandApi";
import { AvailableLanguage } from "@/types/Language";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { useContentCommandApi } from "@/composables/useContentCommandApi";

export async function fetchTranslation(
  languageCode: AvailableLanguage,
  experienceId: string
): Promise<ExperienceTranslation> {
  const { getTranslations } = useContentCommandApi();
  const params = {
    filters: emit(builder.eq("experience_id", experienceId)),
    language_code: languageCode,
  };

  const { data } = await getTranslations<ExperienceTranslation[]>("experience-translations", { params });

  if (data.length === 0) {
    throw new Error(`Could not find any translations for experience ${experienceId} in language ${languageCode}`);
  }

  if (data.length > 1) {
    // eslint-disable-next-line no-console
    console.warn(`Found multiple translations for ${experienceId} in language ${languageCode}.`);
  }

  return data[0];
}
