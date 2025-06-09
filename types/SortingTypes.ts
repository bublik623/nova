export type SortKey =
  | "title"
  | "id"
  | "reference_code"
  | "last_modified"
  | "country"
  | "published"
  | "created"
  | "name"
  | "dates";

export type SortDirection = "asc" | "desc";

export type SortQuery = `${SortKey}-${SortDirection}` | "";
