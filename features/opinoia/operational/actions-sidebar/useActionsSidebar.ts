import { useCompletionPercentage } from "../../shared/completion-percentage/useCompletionPercentage";
import { useMasterLanguage } from "../../shared/i18n/useMasterLanguage";
import { useOpinoiaExperience } from "../../shared/useOpinoiaExperience";
import { useActivityLog } from "./useActivityLog";

export function useActionsSidebar(experienceId: Readonly<Ref<string>>) {
  const experience = useOpinoiaExperience(experienceId);

  const experienceState = computed(() => experience.value.experienceState);
  const { lastEditDate } = useActivityLog(experienceId, useMasterLanguage());
  const canSaveDraft = computed(() => false);
  const canPublish = computed(() => false);
  const completionPercentage = useCompletionPercentage(ref([]));
  const isBusy = computed(() => false);

  function saveDraft() {
    // STUB
  }

  function publish() {
    // STUB
  }

  return {
    experienceState,
    lastEditDate,
    canSaveDraft,
    saveDraft,
    canPublish,
    publish,
    completionPercentage,
    isBusy,
  };
}
