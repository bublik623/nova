import { createApp, App } from "vue";

export function withSetup<T>(rootContainer: Element, composable: () => T): [T, App<Element>] {
  let composableInstance;

  const app = createApp({
    setup() {
      composableInstance = composable();
      // suppress missing template warning
      return () => {};
    },
  });

  app.mount(rootContainer);

  // return the result and the app instance
  // for testing provide/unmount
  return [composableInstance!, app!];
}
