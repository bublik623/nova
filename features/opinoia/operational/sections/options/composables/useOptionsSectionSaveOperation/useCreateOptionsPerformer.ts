import { mapToNewOptionApiPayload, mapToOptionPaxesApiPayload } from "../../mappers/mappers";
import { usePostOptionMutation } from "../../mutations/usePostOptionMutation";
import { usePutOptionPaxesMutation } from "../../mutations/usePutOptionPaxesMutation";
import { Option } from "../../types";

/**
 * Composable responsible for performing the creation of new options.
 * It uses `usePostOptionMutation` to create the option and `usePutOptionPaxesMutation`
 * to set its passenger types, based on the provided `experienceId`.
 *
 * @param experienceId - A Readonly Ref to the current experience ID. Required for creating options.
 * @returns An object containing:
 * - `performBatch`: An async function to create a batch of new options.
 * - `isPerforming`: A Readonly Ref<boolean> indicating if any create or paxe update operations are pending.
 */
export function useCreateOptionsPerformer(experienceId: Readonly<Ref<string | undefined>>) {
  const postOptionMutation = usePostOptionMutation(experienceId);
  const putOptionPaxesMutation = usePutOptionPaxesMutation();

  const isPerforming = computed(() => postOptionMutation.isPending.value || putOptionPaxesMutation.isPending.value);

  async function performBatch(newOptions: Option[]): Promise<void> {
    if (!newOptions.length) return;

    const experienceIdValue = experienceId.value;
    if (!experienceIdValue) {
      throw new Error("no valid experience id");
    }

    const promises = newOptions.map(async (newOption) => {
      const optionId = await createOption(experienceIdValue, newOption);
      await setOptionPaxTypes(optionId, newOption);
    });

    await Promise.all(promises);
  }
  return { performBatch, isPerforming };

  /**
   * This function creates a new Option and return the id assigned to the new Option by the backend.
   * @param experienceId the id of the experience that owns the option
   * @param newOption the option to create
   * @returns the id of the newly created option
   */
  async function createOption(experienceId: string, newOption: Option): Promise<string> {
    const optionPayload = mapToNewOptionApiPayload(experienceId, newOption);
    const response = await postOptionMutation.mutateAsync(optionPayload);
    const newOptionLocationTokens = response.headers["location"].split("/");
    return newOptionLocationTokens[newOptionLocationTokens.length - 1];
  }

  /**
   * This function sets the Pax Types for a new Option
   * @param optionId the id of the option to which the pax types needs to be set
   * @param newOption the option for which to set the pax types
   */
  async function setOptionPaxTypes(optionId: string, newOption: Option) {
    const optionPaxTypesPayload = mapToOptionPaxesApiPayload({ ...newOption, id: optionId });
    await putOptionPaxesMutation.mutateAsync(optionPaxTypesPayload);
  }
}
