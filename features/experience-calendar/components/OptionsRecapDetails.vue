<template>
  <NovaCollapse
    :model-value="true"
    class="mt-4"
    :title="$t('experience.options.customer-details.title')"
    data-testid="customer-details-collapsible"
    size="md"
  >
    <SimpleTable class="CustomerDetailsRecapTable" caption="Pickup Recap Table">
      <template #header>
        <tr>
          <th scope="col">
            {{ $t("experience.options.customer-details.section") }}
          </th>
          <th scope="col">
            {{ $t("experience.options.customer-details.details") }}
          </th>
        </tr>
      </template>
      <template #body>
        <template v-for="([categoryCode, questionCodes], key) in categories" :key="key">
          <tr v-if="questionCodes.length > 0">
            <td>
              {{ $t(`experience.customer-details.category.${categoryCode.toLowerCase()}`) }}
            </td>
            <td>
              {{ questionCodes.join(", ") }}
            </td>
          </tr>
        </template>
      </template>
    </SimpleTable>

    <template #actions>
      <NovaButtonIcon
        name="edit"
        shape="square"
        theme="dark"
        data-testid="customer-details-table-reroute"
        @click.stop="$router.push(path)"
      />
    </template>
  </NovaCollapse>
</template>

<script setup lang="ts">
import SimpleTable from "@/components/Document/SimpleTable/SimpleTable.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import { useCustomerDetailsStore } from "@/features/experience-calendar/store/useCustomerDetailsStore";

interface Props {
  optionId: string;
  experienceId: string;
  path: string;
  readonly?: boolean;
}

const props = defineProps<Props>();

const customerDetailsStore = useCustomerDetailsStore();

useLazyAsyncData(getData);

const categories = computed(() =>
  customerDetailsStore.bookingQuestions.reduce((acc, question) => {
    const hasQuestion: boolean = selectedQuestions.value.has(question.code);
    const updatedArray: string[] = [...(acc.get(question.category) || [])];

    if (hasQuestion) {
      updatedArray.push(question.question);
    }

    return acc.set(question.category, updatedArray);
  }, new Map<string, string[]>())
);

const selectedQuestions = computed(
  () => new Set(customerDetailsStore.fields.questions.value.map((question) => question.booking_question_code))
);

async function getData() {
  await customerDetailsStore.loadData(props.experienceId, props.optionId);
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.CustomerDetails {
  tr {
    display: grid;
    grid-template-columns: repeat(2, minmax(150px, 1fr));
  }

  td {
    padding: rem(3);
  }
}
</style>
