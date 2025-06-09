import { SidebarCategoryField } from "@/types/DocumentSidebar";
import { MaybeRef, get } from "@vueuse/shared";

/**
 * Calculates the percentage completion of a form based on the provided fields.
 *
 * @param fields - The reference or value of an array of SidebarCategoryField objects.
 * @returns - The reference to the computed percentage completion value.
 */
export function useFormPercentageCompletion(fields: MaybeRef<Array<SidebarCategoryField>>) {
  const percentage = ref(0);

  watch(fields, () => updatePercentageCompletion(), {
    immediate: true,
    deep: true,
  });

  function updatePercentageCompletion() {
    let filled = 0;
    let total = 0;

    for (const field of get(fields)) {
      if (!field.required) {
        continue;
      }

      total++;
      filled += field.filled ? 1 : 0;
    }

    percentage.value = Math.round(calcPercentage(filled, total));
  }

  return percentage;
}

function calcPercentage(count: number, total: number, base = 100) {
  if (total === 0) {
    return 0;
  }
  return (count * base) / total;
}
