<template>
  <NovaModal :show="show" @click:on-overlay="$emit('close:modal')">
    <div class="CancellationPoliciesModal" data-testid="cancellation-policies-modal">
      <div class="CancellationPoliciesModal__header">
        <h3 class="mt-2">{{ $t("experience.refund_policies.modal.title") }}</h3>
        <NovaButtonIcon
          name="close"
          shape="square"
          :size="14"
          theme="dark"
          data-testid="category-modal-close-btn"
          @click="$emit('close:modal')"
        />
      </div>

      <div class="CancellationPoliciesModal__body">
        <NovaAlert
          v-show="hasError('policies')"
          status="error"
          size="sm"
          variant="solid"
          class="mb-3"
          data-testid="policies-duplicates-error"
          >{{ $t("experience.refund_policies.modal.error") }}</NovaAlert
        >

        <UtilsRenderHtml :string="$t('experience.refund_policies.modal.body.description')" class="mb-2" />
        <template v-for="(policy, idx) in policies" :key="policy.id">
          <CancellationPoliciesItem
            v-if="policy.action !== 'DELETE'"
            v-model="policies[idx]"
            :show-delete-btn="true"
            :is-invalid="hasError(`${idx}.period`)"
            @click:delete="handlePolicyDelete($event)"
          />
        </template>
        <NovaButton
          size="sm"
          variant="outline"
          data-testid="policies-modal-add-btn"
          :disabled="policies.length === MAX_CANCELLATION_POLICIES"
          @click="addCancellationPolicy"
        >
          + {{ $t("experience.refund_policies.modal.btn.add") }}
        </NovaButton>
      </div>

      <div class="CancellationPoliciesModal__footer">
        <NovaButton
          size="sm"
          data-testid="policies-modal-save-btn"
          :disabled="!isValid"
          @click="$emit('update:modelValue', policies), $emit('close:modal')"
        >
          {{ $t("common.save") }}
        </NovaButton>
      </div>
    </div>
  </NovaModal>
</template>

<script lang="ts" setup>
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaModal from "@/ui-kit/NovaModal/NovaModal.vue";
import { ManageableRefundPolicy } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { MAX_CANCELLATION_POLICIES } from "@/constants/policies.contants";
import CancellationPoliciesItem from "./CancellationPoliciesItem.vue";
import { useGenericValidation } from "@/features/experience-calendar/composables/useGenericValidation";
import { cancellationPoliciesSchema } from "../schemas/cancellation-policies.schema";

export interface Props {
  show: boolean;
  experienceId: string;
  modelValue: ManageableRefundPolicy[];
}

interface Events {
  (e: "close:modal"): void;
  (e: "update:modelValue", value: ManageableRefundPolicy[]): void;
}

const props = defineProps<Props>();
defineEmits<Events>();
const policies = ref([...props.modelValue]);
const { isValid, runValidation, hasError } = useGenericValidation(cancellationPoliciesSchema);

// Reset modal when closing it and opening it again
watch(
  () => props.show,
  () => (policies.value = [...props.modelValue])
);

watch(
  policies,
  (newVal) => {
    runValidation(newVal.filter((p) => p.action !== "DELETE"));
  },
  { deep: true, immediate: true }
);

function addCancellationPolicy() {
  policies.value.push({
    id: Math.floor(Math.random() * 10000).toString(),
    experience: props.experienceId,
    refund_type_code: "PERCENTAGE",
    period: "P3D",
    value: 100,
    action: "CREATE",
  });
}

function handlePolicyDelete(policy: ManageableRefundPolicy) {
  if (policy.action === "CREATE") {
    policies.value = policies.value.filter((p) => p.id !== policy.id);
  } else {
    policy.action = "DELETE";
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.CancellationPoliciesModal {
  width: rem(640);
  height: rem(650);
  display: grid;
  grid-template-rows: 1fr rem(500) 1fr;
  @include font-semibold(14);

  &__header {
    position: relative;
    padding: rem(20) rem(20) rem(15);
    text-align: center;
    border-bottom: var(--border-default);
    @include font-semibold(12);

    & > h3 {
      @include font-bold(16);
    }

    & > button {
      position: absolute;
      right: rem(20);
      top: rem(20);
    }
  }

  &__body {
    padding: rem(20) rem(20) rem(15);

    & > span {
      display: block;
    }
  }

  &__footer {
    padding: rem(20) rem(20) rem(15);
    border-top: var(--border-default);
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
