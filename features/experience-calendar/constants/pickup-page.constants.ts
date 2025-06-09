import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";

export const displayPickupPage = useFeatureFlag("enable_pickup_page");
