"use strict";
export type Error = { code?: string; message?: string };
export type ChangeLog = {
  experienceId: ExperienceId;
  flowCode?: FlowCode;
  languageCode: LanguageCode;
  logs?: Array<Log>;
};
export type Log = {
  id: string;
  field: string;
  entity: string;
  action: "created" | "updated" | "deleted";
  user: string;
  action_date: string;
  flow_code?: FlowCode;
  new_value: string;
  old_value: string;
};
export type ExperienceId = string;
export type LanguageCode = string;
export type FlowCode = string;
