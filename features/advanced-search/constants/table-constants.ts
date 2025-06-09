import { SortKey } from "../types/table";

export const checkboxCellWidth = "25px";
export const openLangCellWidth = "50px";
export const titleCellWidth = "350px";
const refCodeCellWidth = "130px";
const statusCellWidth = "100px";
const lastModifiedCellWidth = "140px";
const supplierCellWidth = "150px";
const cityCellWidth = "140px";
const countryCellWidth = "100px";
const publishedCellWidth = "100px";
const createdCellWidth = "100px";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actionsCellWidth = "38px";

export const CURATION_TABLE_COLUMN_TEMPLATE = [
  checkboxCellWidth,
  openLangCellWidth,
  titleCellWidth,
  refCodeCellWidth,
  statusCellWidth,
  lastModifiedCellWidth,
  supplierCellWidth,
  cityCellWidth,
  countryCellWidth,
  publishedCellWidth,
  createdCellWidth,
].join(" ");

export const TRANSLATION_ROW_TABLE_COLUMN_TEMPLATE = [
  checkboxCellWidth,
  openLangCellWidth,
  titleCellWidth,
  refCodeCellWidth,
  statusCellWidth,
  lastModifiedCellWidth,
  supplierCellWidth,
  cityCellWidth,
  countryCellWidth,
  publishedCellWidth,
  createdCellWidth,
].join(" ");

export const RAW_TABLE_COLUMN_TEMPLATE = [
  checkboxCellWidth,
  titleCellWidth,
  refCodeCellWidth,
  lastModifiedCellWidth,
  supplierCellWidth,
  cityCellWidth,
  countryCellWidth,
  createdCellWidth,
].join(" ");

export const HEADER_KEY_MAP_CURATION: Record<SortKey, string> = {
  title: "experience_content.experience_translation.title",
  id: "id",
  creation_date: "experience_content.experience_translation.creation_date",
  updated_date: "experience_content.experience_translation.updated_date",
  country: "functional_content.experience_location.address.country",
  published_date: "experience_media.distribution_date",
};

export const HEADER_KEY_MAP_RAW: Partial<Record<SortKey, string>> = {
  title: "commercial.title",
  id: "experience_id",
  creation_date: "creation_date",
  updated_date: "updated_date",
  country: "functional.location.address.country",
};
