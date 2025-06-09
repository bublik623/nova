import { describe, expect, test, vi } from "vitest";
import { createPinia } from "pinia";
import { useCustomerDetailsStore } from "../../store/useCustomerDetailsStore";
import { ExperienceBookingQuestions } from "@/types/generated/MetadataExperiencesApi";
import { BookingQuestion } from "@/types/generated/ExperienceMasterDataApi";

const metadataExperienceApiMock = {
  getBookingQuestions: vi.fn(),
  createBookingQuestions: vi.fn(() => Promise.resolve({ data: { id: "new" } })),
  updateBookingQuestions: vi.fn(),
};

vi.mock("@/composables/useMetadataExperienceApi", () => ({
  useMetadataExperienceApi: () => metadataExperienceApiMock,
}));

const experienceMasterDataApiMock = {
  getBookingQuestions: vi.fn(),
};
vi.mock("@/composables/useExperienceMasterDataApi", () => ({
  useExperienceMasterDataApi: () => experienceMasterDataApiMock,
}));

const createExperienceBookingQuestions = ({
  experience_id = "mock-experience-id",
}): Omit<ExperienceBookingQuestions, "id"> & { id?: string } => ({
  experience_id,
  option_id: "option-id",
  booking_questions: [
    { booking_question_code: "FRSTNM", is_apply_all: true, is_mandatory: true },
    { booking_question_code: "LSTNM", is_apply_all: true, is_mandatory: true },
  ],
});

const createQuestions = (): BookingQuestion[] => {
  return [
    {
      id: "1",
      category: "MAIN",
      code: "FRSNM",
      question: "First name?",
      description: "e.g. John",
      language_code: "en",
      answer_type: "TEXT",
      apply_policy: "CONFIGURABLE",
      is_personal_information: false,
    },
  ];
};

describe("useCustomerDetailsStore", () => {
  const exampleExperienceBookingQuestions = createExperienceBookingQuestions({
    experience_id: "test-experience",
  });
  const exampleQuestions = createQuestions();

  metadataExperienceApiMock.getBookingQuestions = vi.fn().mockResolvedValue({
    data: exampleExperienceBookingQuestions,
  });
  experienceMasterDataApiMock.getBookingQuestions = vi.fn().mockResolvedValue({
    data: exampleQuestions,
  });

  test("loads the data and initializes fields", async () => {
    const pinia = createPinia();
    const store = useCustomerDetailsStore(pinia);

    await store.loadData("test-experience", "option-1");

    expect(store.isLoading).toBe(false);

    // selected questions
    expect(store.fields.questions.value).toMatchObject(exampleExperienceBookingQuestions.booking_questions);
  });

  test("save form - new questions", async () => {
    const pinia = createPinia();
    const store = useCustomerDetailsStore(pinia);

    const selectedQuestions = createExperienceBookingQuestions({
      experience_id: "test-experience",
    });

    store.fields.questions.value = selectedQuestions.booking_questions;

    await store.saveForm("test-experience", "option-id");

    expect(store.isSaving).toBe(false);
    expect(metadataExperienceApiMock.createBookingQuestions).toHaveBeenCalledWith({
      experience_id: "test-experience",
      option_id: "option-id",
      booking_questions: [
        {
          booking_question_code: "FRSTNM",
          is_apply_all: true,
          is_mandatory: true,
        },
        {
          booking_question_code: "LSTNM",
          is_apply_all: true,
          is_mandatory: true,
        },
      ],
    } as Omit<ExperienceBookingQuestions, "id">);
  });

  test("save form - update existing questions", async () => {
    const selectedQuestions = createExperienceBookingQuestions({
      experience_id: "test-experience",
    });
    selectedQuestions.id = "existing-item-id";

    metadataExperienceApiMock.getBookingQuestions = vi.fn().mockResolvedValue({
      data: selectedQuestions,
    });

    const pinia = createPinia();
    const store = useCustomerDetailsStore(pinia);

    await store.loadData("test-experience", "option-1");

    await store.saveForm("test-experience", "option-id");

    expect(store.isSaving).toBe(false);
    expect(metadataExperienceApiMock.updateBookingQuestions).toHaveBeenCalledWith("existing-item-id", {
      experience_id: "test-experience",
      option_id: "option-id",
      booking_questions: [
        {
          booking_question_code: "FRSTNM",
          is_apply_all: true,
          is_mandatory: true,
        },
        {
          booking_question_code: "LSTNM",
          is_apply_all: true,
          is_mandatory: true,
        },
      ],
    } as Omit<ExperienceBookingQuestions, "id">);
  });
});
