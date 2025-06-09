import { describe, expect, test } from "vitest";

import NovaTextMetrics from "./NovaTextMetrics.vue";
import { mount } from "@vue/test-utils";

describe("NovaTextMetrics", () => {
  const requiredProps = { wordsCount: 10, charactersCount: 20 };

  test("it should mount successfully", () => {
    const component = mount(NovaTextMetrics, { props: requiredProps });

    expect(component.exists()).toBe(true);
  });

  test("it should display the given words count", () => {
    const component = mount(NovaTextMetrics, { props: requiredProps });

    expect(component.find('[data-testid="words-count"]').text()).toBe(`Words: ${requiredProps.wordsCount}`);
  });

  test("it should display the given characters count", () => {
    const component = mount(NovaTextMetrics, { props: requiredProps });

    expect(component.find('[data-testid="characters-count"]').text()).toBe(
      `Characters: ${requiredProps.charactersCount}`
    );
  });

  test("it should display the max characters count when it's passed as a props", () => {
    const component = mount(NovaTextMetrics, { props: { ...requiredProps, maxCharacters: 50 } });

    expect(component.find('[data-testid="max-characters"]').text()).toBe(`/50`);
  });
});
