import { ExperienceBookingInformation } from "@/types/generated/MetadataExperiencesApi";

export const mockBookingInfo: ExperienceBookingInformation[] = [
  {
    id: "12345",
    experience_id: "test-id",
    booking_information: {
      emergency_contact_number: {
        country_calling_code: "+55",
        number: "12345",
      },
      voucher_type: "PRINTED",
    },
  },
];
