/**
 * Helper method for data-testid
 * @example
 * testId("name-input")
 * /=> [data-testid="name-input"]
 */
export const testId = (id: string) => `[data-testid="${id}"]`;

export const startsWithTestId = (id: string) => `[data-testid^="${id}"]`;
