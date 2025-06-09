import { useDeleteOptionMutation } from "../../mutations/useDeleteOptionMutation";

/**
 * Composable responsible for performing the deletion of options.
 * It uses `useDeleteOptionMutation` for the delete operations.
 *
 * @param experienceId - A Readonly Ref to the current experience ID, passed to `useDeleteOptionMutation`.
 * @returns An object containing:
 * - `performBatch`: An async function to delete a batch of options by their IDs.
 * - `isPerforming`: A Readonly Ref<boolean> indicating if any delete operations are pending.
 */
export function useDeleteOptionsPerformer(experienceId: Readonly<Ref<string | undefined>>) {
  const deleteOptionMutation = useDeleteOptionMutation(experienceId);

  const isPerforming = computed(() => deleteOptionMutation.isPending.value);

  async function performBatch(removedOptionIds: string[]): Promise<void> {
    if (!removedOptionIds.length) return;

    const promises = removedOptionIds.map(async (removedOptionId) => {
      await deleteOptionMutation.mutateAsync(removedOptionId);
    });

    await Promise.all(promises);
  }
  return { performBatch, isPerforming };
}
