import { watchDebounced } from "@vueuse/shared";

export function useFormValues<FormValues extends Record<string, any>>(
  initialValues: FormValues,
  onUpdate: () => unknown
) {
  const formValues = ref({ ...initialValues }) as Ref<FormValues>;

  watchDebounced(() => formValues.value, onUpdate, {
    deep: true,
    immediate: false,
    debounce: 250,
  });

  return {
    formValues,
  };
}
