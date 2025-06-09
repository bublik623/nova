<template>
  <div>
    <NovaButton
      class="mt-4"
      size="sm"
      data-testid="experience-options-index-create-option"
      @click="() => (showModal = true)"
    >
      <NovaIcon name="plus" class="mr-2" />
      {{ $t("experience.option.add-option") }}
    </NovaButton>

    <NovaModal :show="showModal">
      <div class="ModalNewOption" data-testid="modal-create-option">
        <p class="ModalNewOption__title">
          {{ $t("experience.new.option.title") }}
        </p>
        <p class="ModalNewOption__description mt-2 mb-4">
          {{ $t("experience.new.option.description") }}
        </p>
        <NovaInputText id="modal-create-option" v-model="title" label="Title"> </NovaInputText>

        <div class="ModalNewOption__buttons mt-4">
          <NovaButton
            data-testid="modal-create-option-cancel-button"
            variant="underlined"
            size="sm"
            @click="(showModal = false), (title = '')"
            >{{ $t("new.experience.modal.cancel") }}</NovaButton
          >
          <NovaButton
            data-testid="modal-create-option-create-button"
            size="sm"
            :style="{
              width: '117px',
            }"
            :disabled="!title.trim() || loading"
            :loading="loading"
            class="ml-4"
            @click="handleCreate()"
          >
            {{ $t("new.experience.modal.create") }}</NovaButton
          >
        </div>
      </div>
    </NovaModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useNotifications } from "@/stores/notifications";
import NovaModal from "@/ui-kit/NovaModal/NovaModal.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useCustomerDetailsStore } from "../store/useCustomerDetailsStore";
import { Option } from "@/types/generated/OfferServiceApi";

export interface Props {
  flow: string;
  experienceId: string;
}

interface Events {
  (e: "option:created", newRoute: string): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const showModal = ref(false);
const title = ref("");
const loading = ref(false);

const notifications = useNotifications();
const { logError } = useLogger();
const offerService = useOfferServiceApi();
const customerDetailsStore = useCustomerDetailsStore();

async function handleCreate() {
  const defaults: Omit<Option, "experience" | "id"> = {
    name: title.value,
    multilanguage: false,
    capacity_type: "unlimited",
    status: "DRAFT",
  };

  loading.value = true;
  try {
    const { data } = await offerService.postOption(props.experienceId, defaults);
    const optionId = data.id as string;

    // OFF-1575 avoid having to save the customer details(CBQs) form separately before completing an option.
    await customerDetailsStore.saveForm(props.experienceId, optionId);

    const newRoute = `/experience/${props.experienceId}/options/${props.flow}/${optionId}`;

    emits("option:created", newRoute);
  } catch (error) {
    logError("create-option", error);
    notifications.addNotification({
      theme: "error",
      message: "experience.option.create.error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.ModalNewOption {
  padding: rem(24);
  width: rem(548);

  &__title {
    @include font-bold(16);

    color: var(--color-text-100);
    text-align: center;
  }

  &__description {
    @include font-regular(14);

    color: var(--color-text-90);
    text-align: center;
  }

  &__buttons {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
