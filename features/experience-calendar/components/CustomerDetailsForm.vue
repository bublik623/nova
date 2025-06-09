<template>
  <div class="customer-details__wrapper">
    <div class="tabs">
      <button
        data-testid="tab-all"
        class="tabs__button"
        :data-active="showSelectedFields === false ? true : null"
        @click="showSelectedFields = false"
      >
        {{ $t("experience.customer-details.tab.all") }}
      </button>
      <button
        data-testid="tab-selected"
        class="tabs__button"
        :data-active="showSelectedFields === true ? true : null"
        @click="showSelectedFields = true"
      >
        {{ $t("experience.customer-details.tab.selected") }}
      </button>
    </div>
    <div v-for="(categoryQuestions, category) in categorizedQuestions" :key="category">
      <NovaCollapse
        class="category"
        :model-value="category === 'MAIN' ? true : false"
        :title="categoryNames[category]"
        :data-testid="`category-${category}`"
      >
        <div>
          <div class="category__header">
            <div>
              {{ $t("experience.customer-details.table.type-of-information") }}
            </div>
            <div>
              {{ $t("experience.customer-details.table.ask-all-participants") }}
            </div>
          </div>
          <div class="category__content">
            <div v-for="(question, index) in categoryQuestions" :key="index" class="question__wrapper">
              <div class="question" data-testid="question">
                <label :for="`checkbox-question-input-${question.code}`" class="question__label">
                  <span class="question__input">
                    <NovaCheckbox
                      v-if="!requiredQuestionCodes.includes(question.code)"
                      :value="`question-input-${question.code}`"
                      :status="formValues[question.code].selected ? 'checked' : 'unchecked'"
                      :disabled="readonly"
                      @update:status="formValues[question.code].selected = !formValues[question.code].selected"
                    />
                    <NovaIcon v-else name="check" />
                  </span>
                  <span class="question__title">{{ question.question }}</span>
                  <span class="question__description">{{ question.description }}</span>
                </label>
              </div>
              <div class="question__ask-for-all">
                <NovaSwitch
                  v-if="formValues[question.code].applyPolicy !== 'BOOKING'"
                  v-model="formValues[question.code].askForAll"
                  :disabled="readonly"
                  data-testid="question-ask-for-all"
                />
                <div v-else class="mr-3">-</div>
              </div>
            </div>
          </div>
        </div>
      </NovaCollapse>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaSwitch from "@/ui-kit/NovaSwitch/NovaSwitch.vue";
import { useNuxtApp } from "#app";
import { CustomerDetailsFields } from "../store/useCustomerDetailsStore";
import { BookingQuestion as ExperienceBookingQuestion } from "@/types/generated/MetadataExperiencesApi";
import { requiredQuestionCodes } from "../constants/customer-details-constants";
import { BookingQuestion } from "@/types/generated/ExperienceMasterDataApi";

export interface CustomerDetailsFormProps {
  questions: BookingQuestion[];
  initialData?: CustomerDetailsFields;
  readonly?: boolean;
}

export interface QuestionFieldValue {
  id: string;
  code: string;
  selected: boolean;
  askForAll: boolean;
  applyPolicy: BookingQuestion["apply_policy"];
}

export type CustomerDetailsValues = Record<string, QuestionFieldValue>;

interface Events {
  (e: "update", data: ExperienceBookingQuestion[]): void;
}

const { $t } = useNuxtApp();
const props = defineProps<CustomerDetailsFormProps>();
const emits = defineEmits<Events>();
const formValues = reactive<CustomerDetailsValues>({});

const showSelectedFields = ref(false);

const filteredQuestionsByTab = computed(() => {
  if (showSelectedFields.value) {
    return props.questions.filter((question) => formValues[question.code].selected === true);
  } else {
    return props.questions;
  }
});

const categorizedQuestions = computed(() => {
  const categories: Partial<Record<BookingQuestion["category"], BookingQuestion[]>> = {};
  for (const question of filteredQuestionsByTab.value) {
    if (question.category in categories) {
      categories[question.category]!.push(question);
    } else {
      categories[question.category] = [question];
    }
  }
  return categories;
});

const categoryNames: Record<BookingQuestion["category"], string> = {
  MAIN: $t("experience.customer-details.category.main"),
  DATETIME: $t("experience.customer-details.category.datetime"),
  PERSONAL: $t("experience.customer-details.category.personal"),
  TRAVEL: $t("experience.customer-details.category.travel"),
  EXTRA: $t("experience.customer-details.category.extra"),
};

function initFormData() {
  for (const question of props.questions) {
    const isQuestionSelected = requiredQuestionCodes.includes(question.code);

    const existingQuestion = props.initialData?.questions.value.find(
      (initialQuestion) => initialQuestion.booking_question_code === question.code
    );

    if (existingQuestion) {
      formValues[question.code] = {
        id: question.id,
        code: question.code,
        selected: existingQuestion.is_mandatory,
        askForAll: existingQuestion.is_apply_all,
        applyPolicy: question.apply_policy,
      };
    } else {
      formValues[question.code] = {
        id: question.id,
        code: question.code,
        selected: isQuestionSelected,
        askForAll: false,
        applyPolicy: question.apply_policy,
      };
    }
  }
}

// returns selected questions
const getSelectedQuestions = (questions: CustomerDetailsValues) => {
  return Object.entries(questions)
    .map(([_key, item]) => item)
    .map((item) => {
      return {
        booking_question_code: item.code,
        is_apply_all: item.askForAll,
        is_mandatory: item.selected,
        apply_policy: item.applyPolicy,
      } as ExperienceBookingQuestion;
    })
    .filter((item) => {
      return item.is_mandatory;
    });
};

// make sure we return the obligatory fields as selected
const getRequiredQuestions = (questions: CustomerDetailsValues) => {
  const requiredQuestions = { ...questions };

  requiredQuestionCodes.forEach((questionCode) => {
    requiredQuestions[questionCode].selected = true;
  });

  return requiredQuestions;
};

const mapFormValues = (values: CustomerDetailsValues) => {
  const formData = { ...values };

  const questions = getRequiredQuestions(formData);
  const selectedQuestions = getSelectedQuestions(questions);

  return selectedQuestions;
};

watch(
  () => props.questions,
  () => {
    initFormData();
  },
  { immediate: true }
);

watch(
  formValues,
  () => {
    const mappedFormValues = mapFormValues(formValues);

    emits("update", mappedFormValues);
  },
  { deep: true, immediate: true }
);
</script>
<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.customer-details {
  &__wrapper {
    display: grid;
    gap: rem(12);
  }
}

.category {
  &__header {
    @include font-regular(14);

    display: flex;
    justify-content: space-between;
    padding: rem(7.5) rem(16);
    border-bottom: var(--border-default);
    color: var(--color-primary-100);
  }

  &__content {
    display: grid;
    gap: rem(22);
    padding: rem(12) rem(16);
  }
}

.question {
  &__wrapper {
    display: flex;
  }

  &__label {
    display: flex;
    align-items: center;
    @include font-semibold(14);
  }

  &__input {
    display: flex;
    align-items: center;
    color: var(--color-primary-100);
    margin-right: rem(16);
  }

  &__description {
    color: var(--color-text-80);
    margin-left: rem(5);
    font-weight: 400;
  }

  &__ask-for-all {
    display: flex;
    align-items: center;
    margin-left: auto;
    margin-right: rem(55);
  }
}

.tabs {
  &__button {
    background-color: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 10px 15px;
    font-size: 16px;
    position: relative;
    @include font-regular(12);

    &:not([data-active="true"]) {
      border-bottom: 1px solid var(--color-neutral-40);
    }

    &[data-active="true"] {
      color: var(--color-primary-100);
    }

    &[data-active="true"]::before {
      position: absolute;
      bottom: -1px;
      left: 0;
      z-index: 1;
      content: "";
      width: 100%;
      height: 3px;
      border-top-left-radius: rem(100);
      border-top-right-radius: rem(100);
      background: var(--color-primary-100);
      color: blue;
    }
  }
}
</style>
