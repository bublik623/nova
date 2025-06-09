import { ExperienceSource, StatusCode } from "@/types/generated/ExperienceRawServiceApi";

export type ExperienceRawOptions = {
  isReadonly: boolean;
  statusCode?: StatusCode;
  productType?: ExperienceSource;
};

export type RawSettingValues = {
  supplier_id: string | undefined;
  collection_criteria: {
    best_value_guaranteed?: string;
    created_with_care?: string;
    exceptional_experiences?: string;
  };
  title: string;
  categories_interests: {
    categories?: string[];
    interests?: string[];
  };
  own_offer: string;
  external_reference_code?: string;
  promotional_options?: string;
  product_brand?: string;
  nat_geo_tour_levels?: string;
};

export type RawExperienceValue = RawSettingValues;
