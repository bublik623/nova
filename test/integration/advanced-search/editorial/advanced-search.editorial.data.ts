import { Supplier } from "@/types/generated/ContractMasterDataApi";
import { City } from "@/types/generated/GeoMasterDataApi";
import { mockData } from "../../utils/mockMasterData";
import { TypedDistributionContentSearchHit } from "@/features/advanced-search/types/seach-hit-overrides";

export const editorialSearchHitsWithDefaultLanguageFilterAndNoQuery: TypedDistributionContentSearchHit[] = [
  {
    content: {
      id: "first-editorial-id",
      reference_code: "1-ref_code",
      experience_content: [
        {
          language_code: "en",
          experience_id: "first-editorial-experience-id",
          supplier_id: "1",
          experience_translation: {
            id: "first editorial en translation id",
            title: "first editorial en translation title",
            name: "first editorial en translation name",
            flow_code: "first editorial en translation flow code",
            status_code: "IN_REVIEW",
            distribution_status: "NOT_READY",
            creation_date: "2023-09-22T08:59:40",
            updated_date: "2023-09-22T08:59:40",
          },
        },
        {
          language_code: "de",
          experience_id: "first-editorial-experience-id",
          supplier_id: "1",
          experience_translation: {
            id: "first editorial de translation id",
            title: "first editorial de translation title",
            name: "first editorial de translation name",
            flow_code: "BASE",
            status_code: "IN_REVIEW",
            distribution_status: "READY",
            creation_date: "2023-09-22T08:59:40",
            updated_date: "2023-09-22T08:59:40",
          },
        },
      ],
      experience_media: {
        flow_code: "BASE",
        status_code: "IN_REVIEW",
      },
      functional_content: {
        experience_location: {
          address: {
            city: "DBV",
            country: "first editorial country",
          },
        },
      },
    },
  },
  {
    content: {
      id: "second-editorial-id",
      reference_code: "2-ref_code",
      experience_content: [
        {
          language_code: "en",
          experience_id: "second-editorial-experience-id",
          supplier_id: "2",
          experience_translation: {
            id: "second editorial en translation id",
            title: "second editorial en translation title",
            name: "second editorial en translation name",
            flow_code: "second editorial en translation flow code",
            status_code: "IN_REVIEW",
            distribution_status: "NOT_READY",
            creation_date: "2023-09-22T08:59:39",
            updated_date: "2023-09-22T08:59:39",
          },
        },
        {
          language_code: "de",
          experience_id: "second-editorial-experience-id",
          supplier_id: "2",
          experience_translation: {
            id: "second editorial de translation id",
            title: "second editorial de translation title",
            name: "second editorial de translation name",
            flow_code: "BASE",
            status_code: "IN_REVIEW",
            distribution_status: "READY",
            creation_date: "2023-09-22T08:59:39",
            updated_date: "2023-09-22T08:59:39",
          },
        },
      ],
      experience_media: {
        flow_code: "BASE",
        status_code: "IN_REVIEW",
        distribution_date: "", // TODO: add value
      },
      functional_content: {
        experience_location: {
          address: {
            city: "DBV",
            country: "second editorial country",
          },
        },
      },
    },
  },
];

export const editorialSearchHitsWithQuery: TypedDistributionContentSearchHit[] = [
  {
    content: editorialSearchHitsWithDefaultLanguageFilterAndNoQuery[0].content,
    highlight_fields: {
      en: {
        "experience_content.experience_translation.title": ["<em>search hit</em> first editorial en translation title"],
      },
      de: {
        "experience_content.experience_translation.title": ["<em>search hit</em> first editorial en translation title"],
      },
    },
  },
];

export const editorialResultsWithFilters: TypedDistributionContentSearchHit[] = [
  editorialSearchHitsWithDefaultLanguageFilterAndNoQuery[0],
];

export const createNthEditorialPage = (nthPage: number): TypedDistributionContentSearchHit[] => {
  return editorialSearchHitsWithDefaultLanguageFilterAndNoQuery.map((el) => ({
    content: {
      ...el.content,
      reference_code: `${el.content.reference_code}-p-${nthPage}`,
    },
  }));
};

export const suppliers: Supplier[] = mockData.suppliers;
export const cities: City[] = mockData.cities;

export const reportFileName = "editorial-export.xlsx";
export const reportFileContent = "editorial export content";
