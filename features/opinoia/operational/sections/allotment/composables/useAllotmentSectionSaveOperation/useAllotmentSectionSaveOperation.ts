import { mapToNewAllotmentApiPayload, mapToExistingAllotmentApiPayload } from "../../api/mappers";
import { isEqual } from "lodash";
import { DeepReadonly } from "vue";
import { useDeleteAllotmentMutation } from "../../api/mutations/useDeleteAllotmentMutation";
import { usePostAllotmentMutation } from "../../api/mutations/usePostAllotmentMutation";
import { usePutAllotmentMutation } from "../../api/mutations/usePutAllotmentMutation";
import { AllotmentData, AllotmentSectionData } from "../../types";

/**
 * Orchestrates the saving (create, update, delete) of an entire allotment section for an experience.
 * It determines the changes between the last saved data and current data, then apply the relevant mutations.
 *
 * @param experienceId - A Readonly Ref to the current experience ID.
 * @returns An object containing:
 * - `save`: An async function to process and save all allotment changes.
 * - `isSaving`: A Readonly Ref<boolean> indicating if any save operations (create, update, or delete) are pending.
 */
export function useAllotmentSectionSaveOperation(experienceId: Ref<string | undefined>) {
  const queryClient = useQueryClient();

  const postAllotment = usePostAllotmentMutation();
  const putAllotment = usePutAllotmentMutation();
  const deleteAllotment = useDeleteAllotmentMutation();

  const isSaving = computed(() => {
    return postAllotment.isPending.value || putAllotment.isPending.value || deleteAllotment.isPending.value;
  });

  /**
   * Persists all changes (creations, updates, deletions) to the allotments.
   * It compares `lastSavedData` with `currentData` to determine the necessary operations.
   *
   * @param lastSavedData - The state of allotment data from the last successful save. Undefined if first save.
   * @param currentData - The current state of allotment data to be saved.
   */
  async function save(
    lastSavedData: DeepReadonly<AllotmentSectionData> | undefined,
    currentData: AllotmentSectionData
  ) {
    if (!experienceId.value) {
      throw new Error("Experience ID is required");
    }

    const newAllotments = getNewAllotments(lastSavedData, currentData);
    const editedAllotments = getEditedAllotments(lastSavedData, currentData);
    const removedAllotmentIds = getRemovedAllotmentIds(lastSavedData, currentData);

    await Promise.all([
      postNewAllotments(newAllotments, experienceId.value),
      putEditedAllotments(editedAllotments, experienceId.value),
      deleteRemovedAllotments(removedAllotmentIds),
    ]);

    await queryClient.invalidateQueries({ queryKey: ["allotments", experienceId] });
  }

  return {
    isSaving,
    save,
  };

  /**
   * Convert the given new allotments to appropriate backend payloads and apply the post mutation.
   * @param newAllotments the array of new allotments that needs to be posted to the backend.
   * @param experienceId the experience ID to associate with the allotments.
   * @returns a Promise resolving once all the mutations are completed.
   */
  async function postNewAllotments(newAllotments: AllotmentData[], experienceId: string) {
    return await Promise.all(
      newAllotments
        .map((newAllotment) => mapToNewAllotmentApiPayload(newAllotment, experienceId))
        .map((payload) => postAllotment.mutateAsync(payload))
    );
  }

  /**
   * Convert the given edited allotments to appropriate backend payloads and apply the put mutation.
   * @param editedAllotments the array of edited allotments that needs to be put to the backend.
   * @param experienceId the experience ID to associate with the allotments.
   * @returns a Promise resolving once all the mutations are completed.
   */
  async function putEditedAllotments(editedAllotments: AllotmentData[], experienceId: string) {
    return await Promise.all(
      editedAllotments
        .map((editedAllotment) => mapToExistingAllotmentApiPayload(editedAllotment, experienceId))
        .map((payload) => putAllotment.mutateAsync(payload))
    );
  }

  /**
   * Apply the delete mutation for all the ids in the given array.
   * @param removedAllotmentIds the array of ids of the allotments removed that needs to be delete from the backend.
   * @returns a Promise resolving once all the mutations are completed.
   */
  async function deleteRemovedAllotments(removedAllotmentIds: string[]) {
    return await Promise.all(
      removedAllotmentIds.map((removedAllotmentId) => deleteAllotment.mutateAsync(removedAllotmentId))
    );
  }
}

/**
 * Compares the last saved allotments data with the current data to identify new allotments.
 *
 * @param currentData - The current state of allotment data.
 * @returns An array of new {@link AllotmentData} objects.
 */
function getNewAllotments(
  lastSavedData: DeepReadonly<AllotmentSectionData> | undefined,
  currentData: AllotmentSectionData
) {
  if (!lastSavedData || lastSavedData.allotments.length === 0) {
    return currentData.allotments;
  }

  return currentData.allotments.filter(
    (currentAllotment) => !lastSavedData.allotments.some((savedAllotment) => savedAllotment.id === currentAllotment.id)
  );
}

/**
 * Compares the last saved allotments data with the current data to identify edited allotments.
 * An allotment is considered edited if its ID matches a previously saved allotment,
 * and its content is different.
 *
 * @param lastSavedData - The last successfully saved state of allotment data. Can be undefined if no data was previously saved.
 * @param currentData - The current state of allotment data.
 * @returns An array of edited {@link AllotmentData} objects.
 */
function getEditedAllotments(
  lastSavedData: DeepReadonly<AllotmentSectionData> | undefined,
  currentData: AllotmentSectionData
) {
  if (!lastSavedData || lastSavedData.allotments.length === 0) {
    return [];
  }

  return currentData.allotments.filter((allotment) =>
    lastSavedData.allotments.some(
      (lastSavedAllotment) => lastSavedAllotment.id === allotment.id && !isEqual(lastSavedAllotment, allotment)
    )
  );
}

/**
 * Identifies allotments that were present in the last saved data but are missing from the current data.
 *
 * @param lastSavedData - The last successfully saved state of allotment data. Can be undefined.
 * @param currentData - The current state of allotment data.
 * @returns An array of string IDs for the removed allotments.
 */
function getRemovedAllotmentIds(
  lastSavedData: DeepReadonly<AllotmentSectionData> | undefined,
  currentData: AllotmentSectionData
) {
  if (!lastSavedData || lastSavedData.allotments.length === 0) {
    return [];
  }

  const lastSavedDataIds = lastSavedData.allotments.map(toId);
  const currentIds = currentData.allotments.map(toId);

  return lastSavedDataIds.filter((lastSavedId) => !currentIds.includes(lastSavedId));

  function toId(allotment: AllotmentData | DeepReadonly<AllotmentData>) {
    return allotment.id;
  }
}
