/**
 * Clears the `code` query parameter from the URL when the user authenticates.
 */
export const useAuthCleanRoute = () => {
  const router = useRouter();
  const route = useRoute();

  onMounted(() => {
    if (route.query?.code) {
      router.replace({ query: { code: undefined } });
    }
  });
};

/**
 * Converts a string containing comma-separated values enclosed in square brackets to an array.
 *
 * @example
 * convertStringToArray("[read, write, delete]");
 * => Returns: ['read', 'write', 'delete']
 *
 * @returns {string[]} An array containing the parsed values from the input string.
 */
export function convertStringToArray(value?: string): string[] {
  if (!value) {
    return [];
  }
  const permissionsStr = value.match(/\[(.*?)\]/)?.[1] || "";
  return permissionsStr.split(",").map((permission) => permission.trim());
}
