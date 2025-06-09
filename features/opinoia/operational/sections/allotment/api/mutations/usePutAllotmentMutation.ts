import { Allotment } from "@/types/generated/OfferServiceApi";
import { useMutation } from "@tanstack/vue-query";

export type PutAllotmentMutationPayload = Allotment & { id: string };

export function usePutAllotmentMutation() {
  const { updateAllotment } = useOfferServiceApi();

  return useMutation({
    mutationKey: ["allotment", "put"],
    mutationFn: (allotment: PutAllotmentMutationPayload) => updateAllotment(allotment),
  });
}
