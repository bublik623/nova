import { BookingQuestion } from "@/types/generated/ExperienceMasterDataApi";
import { ExperienceBookingQuestions } from "@/types/generated/MetadataExperiencesApi";

export const mockExperienceBookingQuestions: ExperienceBookingQuestions = {
  experience_id: "mock-experience-id",
  id: "id-1",
  option_id: "option-id",
  booking_questions: [
    { booking_question_code: "firstname", is_apply_all: true, is_mandatory: true },
    { booking_question_code: "lastname", is_apply_all: true, is_mandatory: true },
  ],
};

export const mockQuestionMasterData: BookingQuestion[] = [
  {
    id: "1",
    category: "MAIN",
    code: "firstname",
    question: "First name?",
    description: "e.g. John",
    language_code: "en",
    answer_type: "TEXT",
    is_personal_information: false,
    apply_policy: "PARTICIPANT",
  },
  {
    id: "2",
    category: "MAIN",
    code: "lastname",
    question: "Last name?",
    description: "e.g. Doe",
    language_code: "en",
    answer_type: "TEXT",
    is_personal_information: false,
    apply_policy: "PARTICIPANT",
  },
  {
    id: "3",
    category: "DATETIME",
    code: "PICKUPTIME",
    question: "Pickup Time",
    description: "e.g. 14:30",
    language_code: "en",
    answer_type: "TIME",
    is_personal_information: false,
    apply_policy: "BOOKING",
  },
  {
    id: "4",
    category: "MAIN",
    code: "PHONE",
    question: "Phone Number",
    description: "your phone number",
    language_code: "en",
    answer_type: "TEXT",
    is_personal_information: false,
    apply_policy: "CONFIGURABLE",
  },
];
