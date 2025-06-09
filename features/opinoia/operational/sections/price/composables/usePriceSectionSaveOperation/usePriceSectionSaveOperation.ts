import { mapToNewPricingApiPayload, mapToExistingPricingApiPayload } from "../../api/mappers";
import { isEqual } from "lodash";
import { DeepReadonly } from "vue";
import { useDeleteInternalProductPricingMutation } from "../../api/mutations/useDeleteInternalProductPricingMutation";
import { usePostInternalProductPricingMutation } from "../../api/mutations/usePostInternalProductPricingMutation";
import { usePutInternalProductPricingMutation } from "../../api/mutations/usePutInternalProductPricingMutation";
import { Price, PriceSectionData } from "../../types";
import { useOptionsQuery } from "../../../options/queries/useOptionsQuery";

/**
 * Orchestrates the saving (create, update, delete) of an entire price section for an experience.
 * It determines the changes between the last saved data and current data, then apply the relevant mutations.
 *
 * @param experienceId - A Readonly Ref to the current experience ID.
 * @returns An object containing:
 * - `save`: An async function to process and save all price changes.
 * - `isSaving`: A Readonly Ref<boolean> indicating if any save operations (create, update, or delete) are pending.
 */
export function usePriceSectionSaveOperation(experienceId: Ref<string | undefined>) {
  const optionsQuery = useOptionsQuery(experienceId);
  const optionIds = computed(() => optionsQuery.data.value?.map((option) => option.id!) ?? []);
  const queryClient = useQueryClient();

  const postInternalProductPricing = usePostInternalProductPricingMutation();
  const putInternalProductPricing = usePutInternalProductPricingMutation();
  const deleteInternalProductPricing = useDeleteInternalProductPricingMutation();

  const isSaving = computed(() => {
    return (
      postInternalProductPricing.isPending.value ||
      putInternalProductPricing.isPending.value ||
      deleteInternalProductPricing.isPending.value
    );
  });

  /**
   * Persists all changes (creations, updates, deletions) to the prices.
   * It compares `lastSavedData` with `currentData` to determine the necessary operations.
   *
   * @param lastSavedData - The state of price data from the last successful save. Undefined if first save.
   * @param currentData - The current state of price data to be saved.
   */
  async function save(lastSavedData: DeepReadonly<PriceSectionData> | undefined, currentData: PriceSectionData) {
    const newPrices = getNewPrices(lastSavedData, currentData);
    const editedPrices = getEditedPrices(lastSavedData, currentData);
    const removedPricesIds = getRemovedPricesIds(lastSavedData, currentData);

    await Promise.all([postNewPrices(newPrices), putEditedPrices(editedPrices), deleteRemovedPrices(removedPricesIds)]);

    await queryClient.invalidateQueries({ queryKey: ["internalPricings", optionIds] });
  }

  return {
    isSaving,
    save,
  };

  /**
   * Convert the given new prices to appropriate backend payloads and apply the post mutation.
   * @param newPrices the array of new prices that needs to be posted to the backend.
   * @returns a Promise resolving once all the mutations are completed.
   */
  async function postNewPrices(newPrices: Price[]) {
    return await Promise.all(
      newPrices
        .map((newPrice) => mapToNewPricingApiPayload(newPrice))
        .map((payload) => postInternalProductPricing.mutateAsync(payload))
    );
  }

  /**
   * Convert the given edited prices to appropriate backend payloads and apply the put mutation.
   * @param editedPrices the array of edited prices that needs to be put to the backend.
   * @returns a Promise resolving once all the mutations are completed.
   */
  async function putEditedPrices(editedPrices: Price[]) {
    return await Promise.all(
      editedPrices
        .map((editedPrice) => mapToExistingPricingApiPayload(editedPrice))
        .map((payload) => putInternalProductPricing.mutateAsync(payload))
    );
  }

  /**
   * Apply the delete mutation for all the ids in the given array.
   * @param removedPricesIds the array of ids of the prices removed that needs to be delete from the backend.
   * @returns a Promise resolving once all the mutations are completed.
   */
  async function deleteRemovedPrices(removedPricesIds: string[]) {
    return await Promise.all(
      removedPricesIds.map((removedPriceId) => deleteInternalProductPricing.mutateAsync(removedPriceId))
    );
  }
}

/**
 * Compares the last saved pricings data with the current data to identify new prices.
 *
 * @param currentData - The current state of pricing data.
 * @returns An array of new {@link Price} objects.
 */
function getNewPrices(lastSavedData: DeepReadonly<PriceSectionData> | undefined, currentData: PriceSectionData) {
  if (!lastSavedData || lastSavedData.prices.length === 0) {
    return currentData.prices;
  }

  return currentData.prices.filter(
    (currentPrice) => !lastSavedData.prices.some((savedPrice) => savedPrice.id === currentPrice.id)
  );
}

/**
 * Compares the last saved pricings data with the current data to identify edited prices.
 * A price is considered edited if its ID matches a previously saved price,
 * and its content is different.
 *
 * @param lastSavedData - The last successfully saved state of pricing data. Can be undefined if no data was previously saved.
 * @param currentData - The current state of pricing data.
 * @returns An array of edited {@link Price} objects.
 */
function getEditedPrices(lastSavedData: DeepReadonly<PriceSectionData> | undefined, currentData: PriceSectionData) {
  if (!lastSavedData || lastSavedData.prices.length === 0) {
    return [];
  }

  return currentData.prices.filter((price) =>
    lastSavedData.prices.some((lastSavedPrice) => lastSavedPrice.id === price.id && !isEqual(lastSavedPrice, price))
  );
}

/**
 * Identifies prices that were present in the last saved data but are missing from the current data.
 *
 * @param lastSavedData - The last successfully saved state of pricing data. Can be undefined.
 * @param currentData - The current state of pricing data.
 * @returns An array of string IDs for the removed prices.
 */
function getRemovedPricesIds(lastSavedData: DeepReadonly<PriceSectionData> | undefined, currentData: PriceSectionData) {
  if (!lastSavedData || lastSavedData.prices.length === 0) {
    return [];
  }

  const lastSavedDataIds = lastSavedData.prices.map(toId);
  const currentIds = currentData.prices.map(toId);

  return lastSavedDataIds.filter((lastSavedId) => !currentIds.includes(lastSavedId));

  function toId(price: Price | DeepReadonly<Price>) {
    return price.id;
  }
}
