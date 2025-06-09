import { usePickupExperienceApi } from "@/features/experience-calendar/api/usePickupExperienceApi";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";

export async function updateSupplierIdForPickups(experienceId: string, newSupplierId: string) {
  const offerService = useOfferServiceApi();
  const pickupExperienceApi = usePickupExperienceApi();

  const { data: options } = await offerService.getOptions(experienceId);

  const updatePromises = options.map(async (option) => {
    // Fetch pickup by option ID
    const { data: pickup } = await pickupExperienceApi.getPickupsByOptionId(option.id!);

    // Update pickup's supplier_id
    if (pickup?.id) {
      const { id: _id, ...pickupWithoutId } = pickup;
      await pickupExperienceApi.updatePickup(pickup.id, { ...pickupWithoutId, supplier_id: newSupplierId });
    }
  });

  await Promise.all(updatePromises);
}
