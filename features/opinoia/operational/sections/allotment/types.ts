import { DateRange } from "@/types/DateTypes";

export type AllotmentData = {
  id: string;
  isAtExperienceLevel: boolean;
  optionId?: string;
  dates?: DateRange;
  languages: string[];
  monday?: number;
  tuesday?: number;
  saturday?: number;
  sunday?: number;
  wednesday?: number;
  thursday?: number;
  friday?: number;
};

export interface AllotmentSectionData {
  allotments: AllotmentData[];
}
