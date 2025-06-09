<template>
  <NoContentUtil v-if="readonly && !modelValue.length" />
  <template v-else>
    <CollapsableCheckList
      v-for="(marketList, group) in groupedMarketList"
      :key="group"
      class="mb-3"
      :columns="2"
      :title="group"
      :readonly
      :show-checkbox="!readonly"
      :options="marketList.map((m) => ({ value: m.code, label: m.name }))"
      :model-value="mapGroupToOptions(group)"
      @update:model-value="
        handleMarketGroupUpdate(
          $event.map((opt) => props.markets.find((m) => m.code === opt.value)!),
          group
        )
      "
    />
  </template>
</template>

<script lang="ts" setup>
import { Market } from "@/types/generated/ExperienceMasterDataApi";
import CollapsableCheckList from "./CollapsableCheckList.vue";
import { Option } from "@/types/Option";
import NoContentUtil from "./NoContentUtil.vue";

export interface Props {
  markets: Market[];
  /**
   * Array of market codes. Example: "de-2c"
   */
  modelValue: string[];
  readonly?: boolean;
}

interface Events {
  (e: "update:modelValue", markets: string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const selectedGroupedMarkets = ref(groupMarkets(mapCodesToMarkets(props.modelValue)));
const groupedMarketList = computed(() => groupMarketsList(props.markets));

function mapCodesToMarkets(marketCodes: string[]) {
  return marketCodes.map((c) => props.markets.find((m) => m.code === c)).filter((m): m is Market => m !== undefined);
}

function groupMarkets(markets: Market[]) {
  return markets.reduce<Record<string, Market[]>>((group, market) => {
    if (group[market.category]) {
      group[market.category].push(market);
    } else {
      group[market.category] = [market];
    }
    return group;
  }, {});
}
function groupMarketsList(markets: Market[]) {
  return markets.reduce<Record<string, Market[]>>((group, market) => {
    if (group[market.category]) {
      group[market.category].push(market);
    } else if (!props.readonly || selectedGroupedMarkets.value[market.category]?.length > 0) {
      group[market.category] = [market];
    }
    return group;
  }, {});
}

function mapGroupToOptions(group: string): Option[] {
  return selectedGroupedMarkets.value[group]?.map((m) => ({ value: m.code, label: m.name })) ?? [];
}

function handleMarketGroupUpdate(newMarkets: Market[], group: string) {
  selectedGroupedMarkets.value[group] = newMarkets;
  emit(
    "update:modelValue",
    Object.values(selectedGroupedMarkets.value)
      .flat()
      .map((m) => m.code)
  );
}
</script>
