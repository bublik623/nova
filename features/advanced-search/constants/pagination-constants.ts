// The backend has a hard limit of 10000 items offset.
// If we navigate to 10001 item we get a 400 error.
export const PAGINATION_HARD_CAP = 10000;
export const ITEMS_PER_PAGE = 50;
