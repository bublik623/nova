import { Allotment } from "@/types/generated/OfferServiceApi";
import { useMutation } from "@tanstack/vue-query";

export type PostAllotmentMutationPayload = Omit<Allotment, "id">;

export function usePostAllotmentMutation() {
  const { createAllotment } = useOfferServiceApi();

  return useMutation({
    mutationKey: ["allotment", "post"],
    mutationFn: (allotment: PostAllotmentMutationPayload) => createAllotment(allotment),
  });
}
