export type ManageableItemsActions = "NOOP" | "CREATE" | "EDIT" | "REMOVE" | "DELETE";

// a manageable item is a generic object which can be easily handled in the frontend
export interface ManageableItem {
  id: string;
  name: string;
  visualization_order: number;
  action?: ManageableItemsActions;
}

export type ManageableGenericItem<T extends ManageableItem> = T;
