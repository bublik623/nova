export type SortKey = "title" | "id" | "creation_date" | "updated_date" | "country" | "published_date";
export type SortDirection = "asc" | "desc";

export type SortQuery = `${SortKey}-${SortDirection}` | "";
