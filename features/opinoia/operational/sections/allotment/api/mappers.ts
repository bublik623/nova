import { formatDateForApi, formatDateToString } from "@/features/opinoia/shared/utils/date-utils";
import { AllotmentData } from "../types";
import { PostAllotmentMutationPayload } from "./mutations/usePostAllotmentMutation";
import { PutAllotmentMutationPayload } from "./mutations/usePutAllotmentMutation";

type BaseAllotmentPayload = PostAllotmentMutationPayload & Omit<PutAllotmentMutationPayload, "id">;

export function mapToNewAllotmentApiPayload(newAllotment: AllotmentData, experienceId: string) {
  return mapToBaseAllotmentPayload(newAllotment, experienceId);
}

export function mapToExistingAllotmentApiPayload(editedAllotment: AllotmentData, experienceId: string) {
  const basePayload = mapToBaseAllotmentPayload(editedAllotment, experienceId);
  return { ...basePayload, id: editedAllotment.id };
}

function mapToBaseAllotmentPayload(allotment: AllotmentData, experienceId: string): BaseAllotmentPayload {
  if (!allotment.dates?.from || !allotment.dates?.to) {
    throw new Error("Allotment dates are required");
  }

  return {
    experience_id: experienceId,
    option_id: allotment.optionId,
    date_from: formatDateForApi(formatDateToString(allotment.dates.from)),
    date_to: formatDateForApi(formatDateToString(allotment.dates.to)),
    languages: allotment.languages,
    monday: allotment.monday,
    tuesday: allotment.tuesday,
    wednesday: allotment.wednesday,
    thursday: allotment.thursday,
    friday: allotment.friday,
    saturday: allotment.saturday,
    sunday: allotment.sunday,
  };
}
