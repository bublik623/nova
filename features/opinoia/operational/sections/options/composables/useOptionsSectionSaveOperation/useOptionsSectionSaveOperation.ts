import { isEqual } from "lodash";
import { computed, type DeepReadonly, type Ref } from "vue";
import type { OptionsSectionData, Option as InternalOption } from "../../types";
import { useCreateOptionsPerformer } from "./useCreateOptionsPerformer";
import { useUpdateOptionsPerformer } from "./useUpdateOptionsPerformer";
import { useDeleteOptionsPerformer } from "./useDeleteOptionsPerformer";
import { Option } from "../../types";

/**
 * Orchestrates the saving (create, update, delete) of an entire options section for an experience.
 * It determines the changes between the last saved data and current data, then delegates
 * the respective operations to specialized performer composables.
 *
 * @param experienceId - A Readonly Ref to the current experience ID.
 * @returns An object containing:
 * - `save`: An async function to process and save all option changes.
 * - `isSaving`: A Readonly Ref<boolean> indicating if any save operations (create, update, or delete) are pending.
 */
export function useOptionsSectionSaveOperation(experienceId: Readonly<Ref<string | undefined>>) {
  const createOptionsPerformer = useCreateOptionsPerformer(experienceId);
  const updateOptionsPerformer = useUpdateOptionsPerformer(experienceId);
  const deleteOptionsPerformer = useDeleteOptionsPerformer(experienceId);

  const isSaving = computed(() => {
    return (
      createOptionsPerformer.isPerforming.value ||
      updateOptionsPerformer.isPerforming.value ||
      deleteOptionsPerformer.isPerforming.value
    );
  });

  /**
   * Persists all changes (creations, updates, deletions) to the options.
   * It compares `lastSavedData` with `currentData` to determine the necessary operations.
   *
   * @param lastSavedData - The state of options data from the last successful save. Undefined if first save.
   * @param currentData - The current state of options data to be saved.
   */
  async function save(lastSavedData: DeepReadonly<OptionsSectionData> | undefined, currentData: OptionsSectionData) {
    const newOptions = getNewOptions(currentData);
    const editedOptions = getEditedOptions(lastSavedData, currentData);
    const removedOptionIds = getRemovedOptionsIds(lastSavedData, currentData);

    await Promise.all([
      createOptionsPerformer.performBatch(newOptions),
      updateOptionsPerformer.performBatch(editedOptions),
      deleteOptionsPerformer.performBatch(removedOptionIds),
    ]);
  }

  return {
    isSaving,
    save,
  };
}

// --- Data Diffing Helper Functions ---

/**
 * Filters the current options data to identify new options.
 * New options are identified by an ID starting with a "local" prefix.
 *
 * @param currentData - The current state of options data.
 * @returns An array of new {@link InternalOption} objects.
 */
export function getNewOptions(currentData: OptionsSectionData): InternalOption[] {
  return currentData.options.filter((option) => option.id.startsWith("local"));
}

/**
 * Compares the last saved options data with the current data to identify edited options.
 * An option is considered edited if it's not new, its ID matches a previously saved option,
 * and its content is different.
 *
 * @param lastSavedData - The last successfully saved state of options data. Can be undefined if no data was previously saved.
 * @param currentData - The current state of options data.
 * @returns An array of edited {@link InternalOption} objects.
 */
export function getEditedOptions(
  lastSavedData: DeepReadonly<OptionsSectionData> | undefined,
  currentData: OptionsSectionData
): InternalOption[] {
  if (!lastSavedData) return [];
  return currentData.options.filter(
    (option) =>
      !option.id.startsWith("local") && // Must not be a new option
      lastSavedData.options.some(
        (lastSavedOption) => lastSavedOption.id === option.id && !isEqual(lastSavedOption, option)
      )
  );
}

/**
 * Identifies options that were present in the last saved data but are missing from the current data.
 *
 * @param lastSavedData - The last successfully saved state of options data. Can be undefined.
 * @param currentData - The current state of options data.
 * @returns An array of string IDs for the removed options.
 */
export function getRemovedOptionsIds(
  lastSavedData: DeepReadonly<OptionsSectionData> | undefined,
  currentData: OptionsSectionData
): string[] {
  if (!lastSavedData) return [];
  const lastSavedDataIds = lastSavedData.options.map(toId);
  const currentIds = currentData.options.map(toId);
  // Filter out IDs that were local to begin with and never saved
  return lastSavedDataIds.filter(
    (lastSavedId) => !currentIds.includes(lastSavedId) && !lastSavedId.startsWith("local")
  );

  function toId(option: Option | DeepReadonly<Option>) {
    return option.id;
  }
}
