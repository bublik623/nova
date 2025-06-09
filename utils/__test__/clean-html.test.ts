import { describe, test, expect } from "vitest";
import { cleanHTML } from "../clean-html";

describe("cleanHTML", () => {
  test("it should remove script tags from HTML string", () => {
    const result = cleanHTML("<p>test<script>console.log('XSS attack!')</script></p>");

    expect(result).toBe("<p>test</p>");
  });

  test("it should remove dangerous attributes", () => {
    expect(cleanHTML("<img alt='test' src='javascript:test' />")).toBe('<img alt="test">');

    expect(cleanHTML("<a href='data:text/html'>Link</a>")).toBe("<a>Link</a>");

    expect(cleanHTML("<a xlink:href='data:text/html'>Link</a>")).toBe("<a>Link</a>");

    expect(cleanHTML("<div onClick='attack'>test</div>")).toBe("<div>test</div>");
  });
});
