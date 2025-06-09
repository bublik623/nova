<script setup lang="ts">
import OptionLanguagesDropdown, {
  LanguageOption,
} from "@/features/experience-calendar/components/OptionLanguagesDropdown.vue";
import { mapMasterdataLanguagesToOptions } from "@/features/experience-calendar/utils/option-language-utils";
import { RadioOption } from "@/ui-kit/NovaInputRadio/NovaInputRadio.vue";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import { useVModel } from "@vueuse/core";
import { useMasterData } from "@/stores/master-data";

interface Props {
  modelValue: LanguageOption[];
  isReadonly?: boolean;
  id: string;
}

interface Events {
  (e: "update:modelValue", value: LanguageOption[]): void;
}
const { availableLanguages } = useMasterData();
const languagesAsOptions = computed<LanguageOption[]>(() => mapMasterdataLanguagesToOptions(availableLanguages));

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const { $t } = useNuxtApp();
const selectedLanguages = useVModel(props, "modelValue", emits, { passive: true });
const selectedLanguagesOnMount = props.modelValue;

const radioGroupValue = ref(!!selectedLanguages.value.length);
const radioGroupOptions: RadioOption[] = [
  { label: $t("common.yes"), value: true },
  { label: $t("common.no"), value: false },
];

const handleRadioGroupSelection = (selectedValue: boolean) => {
  if (selectedValue === false) {
    selectedLanguages.value = [];
  } else {
    selectedLanguages.value = [...selectedLanguagesOnMount];
  }
  radioGroupValue.value = selectedValue;
};
</script>

<template>
  <NovaInputRadioGroup
    :id="`${props.id}.radio-group`"
    :model-value="radioGroupValue"
    :options="radioGroupOptions"
    :readonly="isReadonly"
    :readonly-placeholder="$t('common.no-content')"
    name="field-languages.radio-group"
    layout="vertical"
    @update:model-value="e => handleRadioGroupSelection(e as boolean)"
  />
  <div v-if="radioGroupValue" class="mt-4">
    <OptionLanguagesDropdown
      v-model:selected-items="selectedLanguages"
      :model-value="languagesAsOptions"
      :is-readonly="isReadonly"
    />
  </div>
</template>
