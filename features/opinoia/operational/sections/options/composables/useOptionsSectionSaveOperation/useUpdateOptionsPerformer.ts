import { mapToExistingOptionApiPayload, mapToOptionPaxesApiPayload } from "../../mappers/mappers";
import { usePutOptionMutation } from "../../mutations/usePutOptionMutation";
import { usePutOptionPaxesMutation } from "../../mutations/usePutOptionPaxesMutation";
import { Option } from "../../types";

/**
 * Composable responsible for performing updates on existing options.
 * It uses `usePutOptionMutation` to update the option details and `usePutOptionPaxesMutation`
 * to update its passenger types, based on the provided `experienceId`.
 *
 * @param experienceId - A Readonly Ref to the current experience ID. Required for updating options.
 * @returns An object containing:
 * - `performBatch`: An async function to update a batch of edited options.
 * - `isPerforming`: A Readonly Ref<boolean> indicating if any update operations are pending.
 */
export function useUpdateOptionsPerformer(experienceId: Readonly<Ref<string | undefined>>) {
  const putOptionMutation = usePutOptionMutation(experienceId);
  const putOptionPaxesMutation = usePutOptionPaxesMutation();

  const isPerforming = computed(() => putOptionMutation.isPending.value || putOptionPaxesMutation.isPending.value);

  async function performBatch(editedOptions: Option[]): Promise<void> {
    if (!editedOptions.length) return;

    const experienceIdValue = experienceId.value;
    if (!experienceIdValue) {
      throw new Error("no valid experience id for update");
    }

    const promises = editedOptions.flatMap((editedOption) => {
      const updatePromise = updateOption(experienceIdValue, editedOption);
      const setOptionPaxTypesPromise = setOptionPaxTypes(editedOption);

      return [updatePromise, setOptionPaxTypesPromise];
    });

    await Promise.all(promises);
  }

  return { performBatch, isPerforming };

  /**
   * This function updates an existing Option.
   * @param experienceId the id of the experience that owns the option
   * @param editedOption the option to update
   */
  async function updateOption(experienceId: string, editedOption: Option) {
    const payload = mapToExistingOptionApiPayload(experienceId, editedOption);
    await putOptionMutation.mutateAsync(payload);
  }

  /**
   * This function sets the Pax Types for an existing Option
   * @param editedOption the option for which to set the pax types
   */
  async function setOptionPaxTypes(editedOption: Option) {
    const optionPaxTypesPayload = mapToOptionPaxesApiPayload(editedOption);
    await putOptionPaxesMutation.mutateAsync(optionPaxTypesPayload);
  }
}
