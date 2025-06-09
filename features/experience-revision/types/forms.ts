import { AllowedRevisionFlow } from "../schema";
import { RevisionOptions, ExperienceRevision } from "./revision";

export type RevisionFormProps = {
  values: ExperienceRevision | null;
  options: RevisionOptions | null;
  requiredFields: string[];
  flow: AllowedRevisionFlow;
};
