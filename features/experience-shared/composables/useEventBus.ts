import { useEventBus } from "@vueuse/core";

type EventNames = "SAVE_DRAFT" | "SAVE" | "SAVED";

export const eventBusCuration = useEventBus<EventNames>("eventBusCuration");

export const eventBusTranslation = useEventBus<EventNames>("eventBusTranslation");
