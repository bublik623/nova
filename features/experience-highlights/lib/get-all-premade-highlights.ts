import { ExperienceMasterData, useExperienceMasterDataApi } from "@/composables/useExperienceMasterDataApi";
import { useMetadataExperienceApi } from "@/composables/useMetadataExperienceApi";
import { GenericHighlight } from "@/types/Highlights";
import { AvailableLanguage } from "@/types/Language";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";

export type allPremadeHighlights = Awaited<ReturnType<typeof getAllPremadeHighlights>>;

interface PremadeApiKeys {
  metadata: string;
  app: string;
  store: string;
}
export const premadeApiKeys = {
  highlights: {
    metadata: "highlights",
    app: "highlights",
    store: "highlights",
    revision: "highlights",
  },
  included: {
    metadata: "included",
    app: "included",
    store: "included",
    revision: "included",
  },
  non_included: {
    metadata: "non-included",
    app: "non_included",
    store: "included",
    revision: "nonIncluded",
  },
  important_information: {
    metadata: "important-information",
    app: "important_information",
    store: "importantInformation",
    revision: "importantInformation",
  },
} as const;

export async function getAllPremadeHighlights(languageCode: AvailableLanguage, experienceId: string) {
  const masterdata = useExperienceMasterDataApi();

  const masterdataResults = await Promise.all([
    masterdata.getPremades("highlights", { language_code: languageCode }),
    masterdata.getPremades("important-information", { language_code: languageCode }),
    masterdata.getPremades("included", { language_code: languageCode }),
  ]);

  const keyedMasterdata = {
    highlights: masterdataResults[0].data,
    important_information: masterdataResults[1].data,
    included: masterdataResults[2].data,
    non_included: masterdataResults[2].data,
  };

  const metadataPromises = Object.entries(premadeApiKeys).map(([, keys]) => {
    return getPremadeHighlights(keyedMasterdata[keys.app], experienceId, keys);
  });

  const metadataResults = await Promise.all(metadataPromises);

  const keyedResults = {
    premade_highlights: metadataResults[0],
    premade_important_information: metadataResults[3],
    premade_included: metadataResults[1],
    premade_non_included: metadataResults[2],
  };

  return keyedResults;
}

async function getPremadeHighlights(
  highlightsMasterData: ExperienceMasterData,
  experienceId: string,
  keys: PremadeApiKeys
) {
  const metadata = useMetadataExperienceApi();

  const params = {
    filters: emit(builder.eq("experience_id", experienceId)),
  };

  const response = await metadata.get(`experience-${keys.metadata}`, {
    params: { ...params },
  });

  const highlightsRelations = response.data?.[0];

  const translations = new Map<string, unknown>();

  highlightsMasterData.forEach((d) => {
    translations.set(d.code, d);
  });

  // @ts-expect-error cannot index the ExperienceHighlight with a string
  return highlightsRelations?.[keys.app].flatMap((code) => (translations.get(code) || []) as GenericHighlight[]) || [];
}
