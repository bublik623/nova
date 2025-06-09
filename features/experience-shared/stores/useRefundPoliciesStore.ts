import { FormField } from "@/types/Form";
import { RefundPolicy } from "@/types/generated/OfferServiceApiOld";
import { defineStore } from "pinia";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { ManageableItemsActions } from "@/types/ManageableItems";

export type ManageableRefundPolicy = RefundPolicy & {
  action: ManageableItemsActions;
};

export type RefundPolicyField = FormField<Array<ManageableRefundPolicy>, true>;

export const useRefundPoliciesStore = defineStore("useRefundPoliciesStore", () => {
  const offerService = useOfferServiceApi();

  const isLoading = ref(false);
  const isSaving = ref(false);

  const field = reactive<RefundPolicyField>({
    value: [],
    required: true,
    category: "experience_settings",
  });

  async function loadRefundPolicies(experienceId: string) {
    field.value = [];

    isLoading.value = true;
    const { data } = await offerService.getRefundPolicies(experienceId).finally(() => (isLoading.value = false));

    field.value = data.map((d) => ({ ...d, action: "NOOP" }));
  }

  async function saveRefundPolicies() {
    isSaving.value = true;

    try {
      const newPolicies: ManageableRefundPolicy[] = [];
      for (const policy of field.value) {
        if (policy.action === "NOOP") {
          newPolicies.push(policy);
        }
        if (policy.action === "CREATE") {
          delete policy.id;
          const newData = await offerService.postRefundPolicy(policy);
          newPolicies.push({ ...newData, action: "NOOP" });
        }
        if (policy.action === "EDIT") {
          await offerService.putRefundPolicy(policy);
          newPolicies.push({ ...policy, action: "NOOP" });
        }
        if (policy.action === "DELETE") {
          await offerService.deleteRefundPolicy(policy.id ?? "");
        }
      }
      field.value = newPolicies;
    } finally {
      isSaving.value = false;
    }
  }

  function $reset() {
    isLoading.value = false;
    isSaving.value = false;
    field.value = [];
  }

  return {
    field,
    isLoading,
    isSaving,
    loadRefundPolicies,
    saveRefundPolicies,
    $reset,
  };
});
