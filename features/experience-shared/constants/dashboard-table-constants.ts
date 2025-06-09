export const firstCellWidth = "40px";
// distribution status
export const statusCellWidth = "56px";
const titleCellWidth = "315px";
const refCodeCellWidth = "130px";
const createdCellWidth = "100px";
const lastModifiedCellWidth = "130px";
const experienceStatusCellWidth = "380px";
const availabilityCellWidth = "150px";
const translationCellWidth = "80px";
const emptySpaceCellWidth = "1fr";
const actionsCellWidth = "50px";
const cityCellWidth = "80px";

// table template joined with a space
// the output will be something like this: `32px 70px 315px`
export const TABLE_COLUMN_TEMPLATE = [
  firstCellWidth,
  statusCellWidth,
  titleCellWidth,
  refCodeCellWidth,
  createdCellWidth,
  lastModifiedCellWidth,
  experienceStatusCellWidth,
  availabilityCellWidth,
  translationCellWidth,
  emptySpaceCellWidth,
  cityCellWidth,
  actionsCellWidth,
].join(" ");
