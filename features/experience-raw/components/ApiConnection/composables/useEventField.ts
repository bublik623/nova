import { useRawApiConnectionStore } from "@/features/experience-raw/stores/useRawApiConnectionStore";
import { ExperienceExternalCatalog } from "@/types/generated/ExperienceRawServiceApi";
import { NovaSelectSearchOptionItem } from "@/ui-kit/NovaSelectSearch/NovaSelectSearchOption.vue";
import { toLower } from "lodash";

export const useEventField = (opt: {
  searchQuery: Ref<string>;
  supplierId: string;
  selectedEventId: Ref<string | undefined>;
}) => {
  const rawApiConnectionStore = useRawApiConnectionStore();

  function getBadge(event: ExperienceExternalCatalog): NovaSelectSearchOptionItem<string>["badge"] {
    if (event.id === rawApiConnectionStore.linkedEvent?.id) {
      return { text: `Connected`, theme: "solid-green" };
    }

    if (event.linked) {
      return { text: `Connected to ${event.reference_code}`, theme: "middle-grey" };
    }

    return undefined;
  }

  function toMappedEvent(event: ExperienceExternalCatalog): NovaSelectSearchOptionItem<string> & { code?: string } {
    return {
      label: event.sip_name!,
      code: event.sip_id,
      value: event.id!,
      disabled: event.linked,
      badge: getBadge(event),
    };
  }

  const optionsEventList = computed(() =>
    rawApiConnectionStore.eventList ? rawApiConnectionStore.eventList?.map((evt) => toMappedEvent(evt)) : []
  );

  function getEventOption(id?: string) {
    const selectedEvent = rawApiConnectionStore.getEventById(id || "");
    return {
      label: selectedEvent?.sip_name || "",
      value: selectedEvent?.id,
      code: selectedEvent?.sip_id,
    };
  }

  const filteredEventList = computed(() => {
    return optionsEventList.value.filter(
      (option) =>
        toLower(option.label || "").includes(toLower(opt.searchQuery.value)) ||
        toLower(option.code || "").includes(toLower(opt.searchQuery.value))
    );
  });

  const hasValidChanges = computed(
    () => opt.selectedEventId.value !== rawApiConnectionStore.linkedEvent?.id && !!opt.selectedEventId.value
  );

  const eventListLoadedForOtherSupplier = computed(
    () => !rawApiConnectionStore.eventList?.find((event) => event.supplier_id === opt.supplierId)
  );

  const selectedEventOption = computed(() => getEventOption(opt.selectedEventId.value));

  const selectedEventRecap = computed(() => {
    return opt.selectedEventId.value
      ? { code: selectedEventOption.value.code || "", title: selectedEventOption.value.label }
      : undefined;
  });

  const hasLinkedEvent = computed(() => !!rawApiConnectionStore.linkedEvent?.id);

  return {
    optionsEventList,
    filteredEventList,
    hasValidChanges,
    hasLinkedEvent,
    eventListLoadedForOtherSupplier,
    selectedEventOption,
    selectedEventRecap,
  };
};
