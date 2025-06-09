import { MappedCategory } from "@/types/DocumentSidebar";

/**
 * Returns the URL of the next available section in the sidebar based on the current route path.
 * @param sidebarCategories - The sidebar categories object.
 * @param routePath - The current route path.
 * @returns The URL of the next available section, or undefined if there is no next section.
 */
export function getNextAvailableSection(
  sidebarCategories: Record<string, MappedCategory>,
  routePath: string
): string | undefined {
  const sections = Object.values(sidebarCategories);
  const currentIndex = sections.findIndex((el) => el.url.includes(routePath));

  if (sections[currentIndex + 1]) {
    return sections[currentIndex + 1].url;
  }
}
