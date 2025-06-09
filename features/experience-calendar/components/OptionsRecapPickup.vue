<template>
  <NovaCollapse
    :model-value="true"
    class="mt-4"
    :title="$t('experience.options.pickup.title')"
    size="md"
    data-testid="pickup-details-collapsible"
  >
    <SimpleTable class="PickupRecapTable" caption="Pickup Recap Table">
      <template #header>
        <tr>
          <th scope="col">
            {{ $t("experience.options.pickup.name") }}
          </th>
          <th scope="col">
            {{ $t("experience.options.pickup.address") }}
          </th>
        </tr>
      </template>
      <template #body>
        <tr v-for="(pickup, key) in request.data?.value" :key="key">
          <td>
            {{ pickup.name }}
          </td>
          <td>
            {{ pickup.address }}
          </td>
        </tr>
      </template>
    </SimpleTable>

    <template #actions>
      <NovaButtonIcon
        name="edit"
        shape="square"
        theme="dark"
        data-testid="pickup-table-reroute"
        @click.stop="$router.push(pickupPath)"
      />
    </template>
  </NovaCollapse>
</template>

<script setup lang="ts">
import SimpleTable from "@/components/Document/SimpleTable/SimpleTable.vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import { usePickupExperienceApi } from "@/features/experience-calendar/api/usePickupExperienceApi";
import { usePickupPlaceApi } from "@/features/experience-calendar/api/usePickupPlaceApi";
import { PickupPlaceWithId } from "../types/Pickups";

interface Props {
  optionId: string;
  pickupPath: string;
}

const props = defineProps<Props>();

const { getPickupsByOptionId } = usePickupExperienceApi();
const { getPickupPlacesByIds } = usePickupPlaceApi();

const request = useLazyAsyncData(`options-recap-pickup-${props.optionId}`, getData);

async function getData(): Promise<PickupPlaceWithId[]> {
  const { data } = await getPickupsByOptionId(props.optionId);

  const { data: placesByIds } = await getPickupPlacesByIds(data.pickup_place_ids);

  return placesByIds;
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.PickupTable {
  tr {
    display: grid;
    grid-template-columns: repeat(2, minmax(150px, 1fr));
  }

  td {
    padding: rem(3);
  }
}
</style>
