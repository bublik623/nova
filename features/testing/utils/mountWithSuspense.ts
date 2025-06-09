import { h, Suspense, defineComponent, Component } from "vue";
import { mount, flushPromises, VueWrapper, type ComponentMountingOptions } from "@vue/test-utils";
import type { ComponentProps } from "vue-component-type-helpers";

export async function mountWithSuspense<C extends Component, P extends ComponentProps<C>>(
  componentType: C,
  props: Object,
  options?: ComponentMountingOptions<C, P>
) {
  const WrappedComponent = defineComponent({
    render() {
      return h(Suspense, null, {
        default: h(componentType, props),
        fallback: h("div", "loading"),
      });
    },
  });

  const suspenseWrapper = mount(WrappedComponent, options);

  let componentWrapper: VueWrapper | undefined = undefined;
  let timedOut = false;
  const start = Date.now();

  // It looks like Suspense require a bit of waiting not to have an empty VueWrapper
  while (!componentWrapper?.exists() && !timedOut) {
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 20));

    componentWrapper = suspenseWrapper.findComponent(componentType);
    const elapsed = Date.now() - start;
    timedOut = elapsed > 1000;
  }

  if (!componentWrapper?.exists()) {
    throw new Error(`component '${componentType.name}' not ready after timeout`);
  }

  return componentWrapper;
}
