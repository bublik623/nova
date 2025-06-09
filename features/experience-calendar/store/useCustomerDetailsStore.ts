import { FormField } from "@/types/Form";
import {
  BookingQuestion as ExperienceBookingQuestion,
  ExperienceBookingQuestions,
} from "@/types/generated/MetadataExperiencesApi";
import { defineStore } from "pinia";
import { useMetadataExperienceApi } from "@/composables/useMetadataExperienceApi";
import { requiredQuestionCodes } from "../constants/customer-details-constants";
import { BookingQuestion } from "@/types/generated/ExperienceMasterDataApi";
import { useExperienceMasterDataApi } from "@/composables/useExperienceMasterDataApi";

export type CustomerDetailsFields = {
  questions: FormField<ExperienceBookingQuestion[]>;
};

type ExperienceQuestions = Omit<ExperienceBookingQuestions, "id"> & {
  id?: string;
};

export const useCustomerDetailsStore = defineStore("useCustomerDetailsStore", () => {
  const metadataService = useMetadataExperienceApi();
  const { getBookingQuestions: getMasterDataBookingQuestions } = useExperienceMasterDataApi();

  const isLoading = ref(false);
  const isSaving = ref(false);
  const bookingQuestions = ref<BookingQuestion[]>([]);
  const experienceQuestionsData = ref<ExperienceQuestions | undefined>();

  const fields = ref<CustomerDetailsFields>({
    questions: {
      value: [],
      required: true,
      category: "experience_location",
    },
  });

  const isFormValid = computed(() => {
    return !!fields.value.questions.value?.length;
  });

  const isSaved = computed(() => {
    return !!experienceQuestionsData.value?.booking_questions.length;
  });

  const setQuestions = (data: ExperienceBookingQuestion[]) => {
    fields.value.questions.value = data || [];
  };

  // OFF-1575
  const addRequiredQuestions = () => {
    requiredQuestionCodes.forEach((code) => {
      fields.value.questions.value.push({
        booking_question_code: code,
        is_apply_all: false,
        is_mandatory: true,
      });
    });
  };

  const loadData = async (experienceId: string, optionId: string) => {
    setQuestions([]);

    isLoading.value = true;

    const { data: bookingQuestionsData } = await getMasterDataBookingQuestions();
    const { data: experienceBookingQuestionsData } = await metadataService.getBookingQuestions(experienceId, optionId);
    bookingQuestions.value = bookingQuestionsData || [];
    experienceQuestionsData.value = experienceBookingQuestionsData;

    isLoading.value = false;

    setQuestions(experienceBookingQuestionsData?.booking_questions || []);
  };

  /**
   * Create or update form data
   */
  const saveForm = async (experienceId: string, optionId: string) => {
    isSaving.value = true;

    if (!fields.value.questions.value.length) {
      addRequiredQuestions();
    }

    const payload: ExperienceQuestions = {
      experience_id: experienceId,
      option_id: optionId,
      booking_questions: fields.value.questions.value,
    };

    if (experienceQuestionsData.value?.id) {
      await metadataService.updateBookingQuestions(experienceQuestionsData.value.id, payload);
    } else {
      const { data } = await metadataService.createBookingQuestions(payload);
      experienceQuestionsData.value = { ...payload, id: data.id };
    }

    isSaving.value = false;
  };

  return {
    isLoading,
    isSaving,
    isSaved,
    isFormValid,
    fields,
    bookingQuestions,
    setQuestions,
    loadData,
    saveForm,
  };
});
