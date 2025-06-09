import { mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import AdvancedSearchMatches from "./AdvancedSearchMatches.vue";
const props = {
  matches: {
    "commercial.description": [
      "TenÃ­a en su <em>casa</em> una ama que pasaba de los cuarenta y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza que asÃ­ ensillaba el rocÃ­n como",
      "curiosidad y desatino en esto17, que vendiÃ³ muchas hanegas de tierra de sembradura para comprar libros de caballerÃ­as en queIV leer18, y, asÃ­, llevÃ³ a su <em>casa</em>",
      "</p><p>test highlights <em>casa</em> <em>casa</em> </p>",
    ],
    "commercial.customImportantInformation.name.keyword": ["<em>casa</em>"],
    "commercial.infoVoucher": [
      "<p>The voucher must be printed in black and white ink on a caramel paper sheet <em>casa</em></p>",
    ],
    "commercial.customImportantInformation.name": ["<em>casa</em>"],
  },
  fieldsToSkip: ["commercial.title", "commercial.customImportantInformation.name.keyword"],
  stringToRemove: /<p>|<\/p>/g,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

describe("AdvancedSearchMatches", () => {
  test("it should mount correctly", () => {
    const wrapper = mount(AdvancedSearchMatches, { props });

    const tr = wrapper.findAll(".AdvancedSearchMatches");
    expect(tr.length).toBe(5);

    expect(tr[0].text().includes("advanced-search-match-commercial.description")).toBeTruthy();
    expect(tr[1].text().includes("advanced-search-match-commercial.description")).toBeTruthy();
    expect(tr[2].text().includes("advanced-search-match-commercial.description")).toBeTruthy();
    expect(tr[3].text().includes("advanced-search-match-commercial.infoVoucher")).toBeTruthy();
    expect(tr[4].text().includes("advanced-search-match-commercial.customImportantInformation.name")).toBeTruthy();
  });
});
