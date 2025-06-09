import { ExperienceSource } from "@/types/generated/ExperienceRawServiceApi";
import { BaseOption } from "@/types/Option";

export type AvailableProductTypes = Extract<ExperienceSource, "NOVA" | "ASX" | "SIP" | "INTERNAL">;

export type AvailableProductOptions = BaseOption<AvailableProductTypes>[];
