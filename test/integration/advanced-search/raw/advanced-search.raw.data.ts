import { Supplier } from "@/types/generated/ContractMasterDataApi";
import { City } from "@/types/generated/GeoMasterDataApi";
import { mockData } from "../../utils/mockMasterData";
import { TypedRawSearchHit } from "@/features/advanced-search/types/seach-hit-overrides";

export const rawSearchHitsWithNoQuery: TypedRawSearchHit[] = [
  {
    content: {
      id: "first-raw-id",
      experience_id: "first-raw-experience-id",
      reference_code: "1-ref_code",
      commercial: {
        title: "first raw title",
      },
      functional: {
        location: {
          address: {
            city: "DBV",
            country: "first raw country",
          },
        },
      },
      supplier_id: "1",
      creation_date: "2024-01-26T09:26:44",
      updated_date: "2024-01-26T09:26:44",
      status_code: "IN_CREATION",
      flow_code: "BASE",
    },
  },
  {
    content: {
      id: "second-raw-id",
      experience_id: "second-raw-experience-id",
      reference_code: "2-ref_code",
      commercial: {
        title: "second raw title",
      },
      functional: {
        location: {
          address: {
            city: "ZAD",
            country: "second raw country",
          },
        },
      },
      supplier_id: "2",
      creation_date: "2024-01-26T09:25:28",
      updated_date: "2024-01-26T09:25:28",
      status_code: "IN_CREATION",
      flow_code: "BASE",
    },
  },
];

export const rawSearchHitsWithQuery: TypedRawSearchHit[] = [
  {
    content: rawSearchHitsWithNoQuery[0].content,
    highlight_fields: {
      "commercial.title": ["<em>search hit</em> first raw title"],
    },
  },
];

export const rawResultsWithFilters: TypedRawSearchHit[] = [rawSearchHitsWithNoQuery[0]];

export const createNthRawPage = (nthPage: number): TypedRawSearchHit[] => {
  return rawSearchHitsWithNoQuery.map((el) => ({
    content: {
      ...el.content,
      reference_code: `${el.content.reference_code}-p-${nthPage}`,
    },
  }));
};

export const suppliers: Supplier[] = mockData.suppliers;
export const cities: City[] = mockData.cities;

export const reportFileName = "raw-export.xlsx";
export const reportFileContent = "raw export content";
