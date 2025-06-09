import { MappedCategory } from "@/types/DocumentSidebar";

export const checkDocumentValidity = (documentSections: { [key: string]: MappedCategory }) => {
  return Object.values(documentSections).every((el) => (el.required ? el.completed : true));
};
