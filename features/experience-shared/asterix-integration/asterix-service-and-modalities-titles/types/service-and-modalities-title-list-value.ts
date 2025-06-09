import { z } from "zod";

export const serviceAndModalitiesTitleValueSchema = z.object({
  serviceCode: z.string(),
  title: z.string().min(1).max(70),
  modalities: z.array(
    z.object({
      modalityCode: z.string(),
      title: z.string().min(1).max(70),
    })
  ),
});
export const serviceAndModalitiesTitleListValueSchema = z.array(serviceAndModalitiesTitleValueSchema);

export type ServiceAndModalitiesTitleValue = z.infer<typeof serviceAndModalitiesTitleValueSchema>;
export type ServiceAndModalitiesTitleListValue = z.infer<typeof serviceAndModalitiesTitleListValueSchema>;
