/**
 * Sanitize an HTML string
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  str   The HTML string to sanitize
 * @return       The sanitized string or nodes
 */
export function cleanHTML(str: string) {
  // Convert the string to HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, "text/html");
  const html = doc.body || document.createElement("body");

  // Remove script tags
  const scripts = html.querySelectorAll("script");
  for (const script of scripts) {
    script.remove();
  }

  clean(html);
  return html.innerHTML;
}

/**
 * Remove dangerous stuff from the HTML document's nodes
 * @param html The HTML document
 */
function clean(html: Element) {
  const nodes = html.children;
  for (const node of nodes) {
    // Loop through each attribute
    // If it's dangerous, remove it
    const atts = node.attributes;
    for (const { name, value } of atts) {
      if (!isPossiblyDangerous(name, value)) {
        continue;
      }
      node.removeAttribute(name);
    }

    clean(node);
  }
}

/**
 * Check if the attribute is potentially dangerous
 * @param   name  The attribute name
 * @param   value The attribute value
 * @return       If true, the attribute is potentially dangerous
 */
function isPossiblyDangerous(name: string, value: string) {
  const val = value.replace(/\s+/g, "").toLowerCase();
  if (["src", "href", "xlink:href"].includes(name)) {
    if (val.includes("javascript:") || val.includes("data:")) {
      return true;
    }
  }
  if (name.startsWith("on")) {
    return true;
  }
  return false;
}
