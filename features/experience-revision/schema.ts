import { z } from "zod";

export type AllowedRevisionFlow = z.infer<typeof allowedRevisionFlowSchema>;
export const allowedRevisionFlowSchema = z.enum(["raw", "curation", "translation", "media"]);
