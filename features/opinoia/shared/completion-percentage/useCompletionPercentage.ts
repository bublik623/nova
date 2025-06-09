export type Field = {
  isRequired: boolean;
  isValid: boolean;
};

export function useCompletionPercentage(fields: Readonly<Ref<Field[]>>) {
  const requiredFields = computed(() => fields.value.filter((field) => field.isRequired));
  const requiredFieldsCount = computed(() => requiredFields.value.length);
  const validRequiredFields = computed(() => requiredFields.value.filter((requiredFields) => requiredFields.isValid));
  const validRequiredFieldsCount = computed(() => validRequiredFields.value.length);

  const completionPercentage = computed(() =>
    calculateCompletionPercentage(validRequiredFieldsCount.value, requiredFieldsCount.value)
  );

  return completionPercentage;
}

function calculateCompletionPercentage(validRequiredFieldsCount: number, requiredFieldsCount: number) {
  if (requiredFieldsCount === 0) {
    return 0;
  }

  return Math.round((validRequiredFieldsCount * 100) / requiredFieldsCount);
}
