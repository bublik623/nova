import { INSTANT_DURATION } from "@/constants/date.constants";
import { getChangedValues } from "@/features/experience-shared/utils/get-changed-values";
import { Experience as OfferExperience, ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { defu } from "defu";

import { z } from "zod";

const offerExperienceSchema = z.object({
  type: z.nativeEnum(ExperienceType),
  state: z.string(),
  confirmation_time: z.string(),
  cutoff_time: z.string(),
  currency: z.string(),
  supplier: z.string(),
  uuid: z.string(),
}) satisfies z.ZodType<OfferExperience>;

export function getOfferExperienceInitialValues(overrides?: Partial<OfferExperience>): OfferExperience {
  const initialValues: OfferExperience = {
    type: ExperienceType.CALENDAR_TIMESLOTS,
    state: "DRAFT",
    confirmation_time: "P0D",
    cutoff_time: "P0D",
    currency: "EUR",
    supplier: "",
    uuid: "",
  };

  const result = offerExperienceSchema.parse(defu(overrides, initialValues));

  return result;
}

export function generateOfferExperiencePayload<T extends Partial<OfferExperience>>(
  getInitialFields: () => T,
  mapFieldsToService: (overrideSupplierId?: string) => T,
  getCutoffTime: () => string,
  isInstantConfirmation: boolean,
  supplierIdOverride?: string
) {
  const initialFields = getInitialFields();
  const updatedFields = mapFieldsToService(supplierIdOverride);

  updatedFields.confirmation_time = isInstantConfirmation ? INSTANT_DURATION : updatedFields.confirmation_time;
  updatedFields.cutoff_time = getCutoffTime();

  const changedValues = getChangedValues(initialFields, updatedFields);

  return {
    isSupplierChanged: Boolean(changedValues.supplier),
    payload: Object.keys(changedValues).length > 0 ? updatedFields : null,
  };
}
