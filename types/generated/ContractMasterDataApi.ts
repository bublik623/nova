"use strict";
export type Error = { code?: string; message?: string };
export type Language = {
  id?: string;
  code: string;
  name: string;
  description?: string;
};
export type Currency = {
  id?: string;
  code: string;
  name: string;
  language_code?: string;
  description?: string;
  symbol: string;
  precision?: number;
};
export type Supplier = {
  id?: string;
  core_id?: string;
  olp_id?: string;
  source?: "NOVA" | "BP" | "ASX" | "CORE";
  name: string;
  email: string;
  commission?: number;
};
