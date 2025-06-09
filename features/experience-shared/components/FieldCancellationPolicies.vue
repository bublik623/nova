<template>
  <NovaInputRadioGroup
    :model-value="refundable ? 'REFUNDABLE' : 'NON_REFUNDABLE'"
    layout="vertical"
    name="refund_polices"
    :readonly
    :options="[
      {
        value: 'NON_REFUNDABLE',
        label: $t('experience.refund_policies.radio.no'),
      },
      {
        value: 'REFUNDABLE',
        label: $t('experience.refund_policies.radio.yes'),
      },
    ]"
    @update:model-value="handleUpdateRefundPolicies($event as any)"
  />

  <template v-if="refundable">
    <span v-if="policies.length === 0" class="CancellationPolicies__empty-text">{{
      $t("experience.refund_policies.empty")
    }}</span>
    <div v-else>
      <span class="CancellationPolicies__filled-text">{{ $t("experience.refund_policies.list.title") }}</span>
      <CancellationPoliciesItem
        v-for="policy in filteredPolicies"
        :key="policy.id"
        :show-delete-btn="!readonly"
        :model-value="policy"
        :readonly="true"
        @click:delete="
          policyToDelete = $event;
          showDeletePolicyModal = true;
        "
      />
      <NovaModalConfirm
        :title="$t('experience.refund_policies.confirm.modal.title')"
        :description="$t('experience.refund_policies.confirm.modal.description')"
        :cta-cancel-text="$t('common.cancel')"
        :cta-confirm-text="$t('common.delete')"
        :show-modal="showDeletePolicyModal"
        :confirm-callback="handleDeletePolicy"
        :cancel-callback="() => (showDeletePolicyModal = false)"
      />
    </div>

    <div v-show="refundable && !readonly" class="CancellationPolicies__cta">
      <NovaButton
        v-show="filteredPolicies.length < MAX_CANCELLATION_POLICIES"
        size="sm"
        data-testid="cancellation-policies-add"
        @click="showModal = true"
        >+ {{ $t("experience.refund_policies.btn.add") }}</NovaButton
      >
      <NovaButton
        v-if="policies.length > 0"
        size="sm"
        variant="outline"
        data-testid="cancellation-policies-edit"
        @click="showModal = true"
      >
        <NovaIcon name="edit" class="mr-1" />
        {{ $t("experience.refund_policies.btn.edit") }}
      </NovaButton>
    </div>

    <CancellationPoliciesModal
      :show="showModal"
      :model-value="policies"
      :experience-id="experienceId"
      @close:modal="showModal = false"
      @update:model-value="policies = [...$event]"
    />
  </template>
</template>

<script lang="ts" setup>
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import { ManageableRefundPolicy } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { useVModel } from "@vueuse/core";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import CancellationPoliciesModal from "./CancellationPoliciesModal.vue";
import CancellationPoliciesItem from "./CancellationPoliciesItem.vue";
import NovaModalConfirm from "@/ui-kit/NovaModalConfirm/NovaModalConfirm.vue";
import { MAX_CANCELLATION_POLICIES } from "@/constants/policies.contants";

export interface Props {
  experienceId: string;
  modelValue: ManageableRefundPolicy[];
  readonly?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: ManageableRefundPolicy[]];
}>();

const policies: Ref<ManageableRefundPolicy[]> = useVModel(props, "modelValue", emit);
const filteredPolicies = computed(() => policies.value.filter((p) => p.action !== "DELETE")); // Don't show the policies that needs to be deleted
const refundable = ref(policies.value.length > 0);
const showModal = ref(false);
const showDeletePolicyModal = ref(false);

// update refundable.value if policies comes late
const unwatchPolicies = watch(policies, (value) => {
  refundable.value = value.length > 0;
});

function handleUpdateRefundPolicies(value: "REFUNDABLE" | "NON_REFUNDABLE") {
  if (value === "NON_REFUNDABLE") {
    policies.value = policies.value.reduce<ManageableRefundPolicy[]>((res, r) => {
      // If the policy is already saved in the BE, we delete it
      if (r.id) {
        res.push({ ...r, action: "DELETE" });
      }
      return res;
    }, []);
  }

  // stop watching policies to avoid side effect on refundable.value
  unwatchPolicies();
  refundable.value = value === "REFUNDABLE" ? true : false;
}

const policyToDelete = ref<ManageableRefundPolicy | null>(null);
async function handleDeletePolicy() {
  if (policyToDelete.value == null) {
    return;
  }

  if (policyToDelete.value?.action === "CREATE") {
    policies.value = policies.value.filter((p) => p.id !== policyToDelete.value?.id);
  } else {
    policyToDelete.value.action = "DELETE";
    emit("update:modelValue", policies.value);
  }

  policyToDelete.value = null;
  showDeletePolicyModal.value = false;
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.CancellationPolicies {
  &__empty-text,
  &__filled-text {
    display: block;
    margin-top: rem(30);
    font-style: italic;
    color: var(--color-text-90);
    @include font-semibold(14);
  }

  &__empty-text {
    font-style: italic;
  }

  &__cta {
    margin-top: rem(16);
    display: flex;
    gap: rem(10);
  }
}
</style>
