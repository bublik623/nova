/**
 * Creates a simple id meant to be used only on client side
 * @return an unique id
 */
export function uuid() {
  return "local-" + Math.random().toString(36).substring(2);
}
