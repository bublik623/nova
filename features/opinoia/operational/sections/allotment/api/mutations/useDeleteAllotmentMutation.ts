import { useMutation } from "@tanstack/vue-query";

export function useDeleteAllotmentMutation() {
  const { deleteAllotment } = useOfferServiceApi();

  return useMutation({
    mutationKey: ["allotment", "delete"],
    mutationFn: (id: string) => deleteAllotment(id),
  });
}
