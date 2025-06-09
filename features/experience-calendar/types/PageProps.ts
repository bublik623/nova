import { ViewType } from "@/features/experience-curation/components/ViewSelect.vue";

export interface CalendarPageProps {
  selectedView: ViewType;
  isReadonly: boolean;
}
