/**
 * Mocks the loading of a composable function in an app.
 *
 * @param composable - The composable function to be loaded.
 * @returns An array containing the result of the composable function and the app instance.
 */
export function mockLoadComposableInApp<T extends (...args: any[]) => any>(
  composable: T
): {
  result: ReturnType<T>;
  app: typeof app;
} {
  let result: ReturnType<T> = {} as ReturnType<T>;

  const app = createApp({
    // @ts-expect-error it works  ¯\_(ツ)_/¯
    setup() {
      result = composable();
      return () => {
        return "<div/>";
      };
    },
  });
  // @ts-expect-error .
  app.mount(document.createElement("div"));
  return {
    result,
    app,
  };
}
