import { useEventBus } from "@vueuse/core";

export const busOverviewSelectAll = useEventBus<boolean>("busOverviewSelectAll");
