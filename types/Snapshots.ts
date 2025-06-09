import {
  ExperienceSource,
  Snapshot as SnapshotFromOpenApi,
  VoucherType,
} from "@/types/generated/ExperienceRawServiceApi";
import { ContactNumber } from "./generated/MetadataExperiencesApi";

export type Snapshot = SnapshotFromOpenApi & {
  creation_date: string;
  updated_date: string;
  experience_source: ExperienceSource;
  experience_functional_information: SnapshotFromOpenApi["experience_functional_information"] & {
    external_reference_code: string;
    interests: { codes: string[] };
    categories: { codes: string[] };
    additional_services: { codes: string[] };
    markets: { codes: string[] };
    booking_information: {
      information?: {
        voucher_type: VoucherType;
        emergency_contact_number: ContactNumber;
      };
    };
  };
};
