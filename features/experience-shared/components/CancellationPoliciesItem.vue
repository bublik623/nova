<template>
  <div v-if="!readonly" class="CancellationPoliciesItem" :invalid="isInvalid" data-testid="cancellation-policies-item">
    <span>{{ $t("experience.refund_policies.item.cancel") }}</span>
    <NovaInputNumber
      id="cancellation-policies"
      v-model="parsedPolicy.period"
      data-testid="cancellation-policies-time-input"
      :min-value="1"
      @update:model-value="handleUpdatePolicy"
    />
    <NovaSelect
      data-testid="cancellation-policies-select"
      :options="selectOptions"
      :selected="parsedPolicy.duration === 'HOURS' ? selectOptions[0] : selectOptions[1]"
      @select:option="(e) => {parsedPolicy.duration = e.value as PolicyForm['duration']; handleUpdatePolicy();}"
    />
    <span>{{ $t("experience.refund_policies.item.text") }}</span>
    <NovaInputNumber
      id="cancellation-policies"
      v-model="parsedPolicy.amount"
      data-testid="cancellation-policies-amount-input"
      :min-value="1"
      :max-value="100"
      @update:model-value="handleUpdatePolicy"
    />
    %
    <NovaButtonIcon
      v-show="showDeleteBtn"
      name="trash"
      shape="square"
      data-testid="cancelletion-policy-item-delete"
      @click="$emit('click:delete', modelValue)"
    />
  </div>
  <div
    v-else
    class="CancellationPoliciesItem CancellationPoliciesItem--readonly"
    data-testid="cancellation-policies-item-readonly"
  >
    <span>{{ $t("experience.refund_policies.item.cancel") }}</span>
    <span class="CancellationPoliciesItem__bold-text"
      >{{ parsedPolicy.period }} {{ parsedPolicy.duration === "DAYS" ? "days" : "hours" }}</span
    >
    <span>{{ $t("experience.refund_policies.item.text") }}</span>
    <span class="CancellationPoliciesItem__bold-text">{{ parsedPolicy.amount }} %</span>
    <NovaButtonIcon
      v-show="showDeleteBtn"
      style="margin-left: auto"
      name="trash"
      shape="square"
      data-testid="cancelletion-policy-item-delete"
      @click="$emit('click:delete', modelValue)"
    />
  </div>
</template>

<script lang="ts" setup>
import { useNuxtApp } from "#app";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaInputNumber from "@/ui-kit/NovaInputNumber/NovaInputNumber.vue";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import { ManageableRefundPolicy } from "../stores/useRefundPoliciesStore";

interface PolicyForm {
  period?: number;
  duration?: "HOURS" | "DAYS";
  amount?: number;
}

export interface Props {
  modelValue: ManageableRefundPolicy;
  isInvalid?: boolean;
  readonly?: boolean;
  showDeleteBtn?: boolean;
}

interface Events {
  (e: "update:modelValue", value: ManageableRefundPolicy): void;
  (e: "click:delete", value: ManageableRefundPolicy): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const { $t, $isoDuration } = useNuxtApp();
const selectOptions = [
  { value: "HOURS", label: $t("experience.refund_policies.item.hours") },
  { value: "DAYS", label: $t("experience.refund_policies.item.days") },
];

const parsedPolicy = ref<PolicyForm>({});

function parseCancellationPolicy(policy: ManageableRefundPolicy) {
  const parsedDuration = $isoDuration(policy.period).parse();

  parsedPolicy.value = {
    period: parsedDuration.days || parsedDuration.hours,
    duration: parsedDuration.days ? "DAYS" : "HOURS",
    amount: policy.value,
  };
}

watch(
  () => props.modelValue,
  (newVal) => parseCancellationPolicy(newVal),
  { immediate: true }
);

function handleUpdatePolicy() {
  const policy = parsedPolicy.value;
  const durationObj = policy.duration === "DAYS" ? { days: policy.period } : { hours: policy.period };
  const newPolicy: ManageableRefundPolicy = {
    ...props.modelValue,
    period: $isoDuration(durationObj).toString(),
    value: policy.amount ?? 0,
    action: props.modelValue.action === "CREATE" ? "CREATE" : "EDIT",
  };

  emit("update:modelValue", newPolicy);
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.CancellationPoliciesItem {
  width: 100%;
  margin: rem(12) 0;
  min-height: rem(32);
  padding: rem(5);
  display: grid;
  grid-template-columns: repeat(6, auto) 1fr;
  justify-items: end;
  align-items: center;
  gap: rem(5);
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  @include font-regular(14);

  &--readonly {
    display: flex;
    padding: 0;
    padding-left: rem(8);
    margin: rem(16) 0;
  }

  &__bold-text {
    @include font-bold(14);
  }

  &[invalid="true"] {
    border-color: var(--color-error-100);
  }
}
</style>
