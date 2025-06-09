"use strict";
export type ProblemDetails = {
  type?: string;
  status?: number;
  title: string;
  detail?: string;
  instance?: string;
  code?: string;
  errors?: Errors;
};
export type Errors = Array<ErrorDetail>;
export type ErrorDetail = {
  detail: string;
  pointer?: string;
  parameter?: string;
  header?: string;
  code?: string;
};
export type PlainError = { code?: string; message?: string };
export type ActiveConfiguration = {
  registration_open?: boolean;
  integrations?: Array<string>;
  experiences_intervals?: Array<string>;
  experiences_types?: Array<string>;
};
export type EnrollmentConfiguration = {
  registration: RegistrationStatus;
  general_notification: string;
  notification_mapping: {};
  integrations: Array<string>;
  experiences_intervals: Array<string>;
  experiences_types: Array<string>;
};
export type CompleteEnrollmentConfiguration = {
  configurations?: EnrollmentConfiguration;
  created_by?: string;
  created_at?: string;
};
export type RegistrationStatus = unknown;
export type EnrollmentRequestPost = {
  company_name: string;
  company_legal_name: string;
  based_in: string;
  countries_code_operate_in: Array<string>;
  number_of_activities_offered: string;
  type_of_activities_offered: Array<string>;
  commission: string;
  has_tui_employee_relationships: boolean;
  is_tui_employee: boolean;
  email_for_communication: string;
  phone_number: string;
  website_socialmedia_url: string;
  has_api_integration: boolean;
  list_of_api_integrations_used?: Array<string>;
  free_comment?: string;
  agreement: boolean;
};
export type EnrollmentRequest = unknown;
export type RejectionReasons = { reasons?: Array<string> };
export type Approve = { commission?: number; assignee?: Array<Assignee> };
export type Assignee = { username?: string; email?: string };
