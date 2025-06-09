const GITLAB_PAGES_URL = "https://nova-dx-offer-content-39d504029f02f2225b9dbcdf673217df17797b8ef.pages.devops.tui";
const GITLAB_PAGES_URL_REGEX = /nova-dx-offer-content/;
const FEATURE_BRANCH_URL_REGEX = /dx\.pages\.devops\.tui/;

/**
 * Checks if the current URL is a feature branch URL.
 */
export function isFeatureBranchUrl() {
  return FEATURE_BRANCH_URL_REGEX.test(window.location.href);
}

/**
 * Checks if the current URL is a GitLab Pages URL.
 */
export function isGitlabPagesUrl() {
  return GITLAB_PAGES_URL_REGEX.test(window.location.href);
}

/**
 * if we are on a feature branch link, returns the gitlab pages URL
 * otherwise returns undefined.
 */
export function getSSOProxyUrl() {
  return isFeatureBranchUrl() ? GITLAB_PAGES_URL : undefined;
}

/**
 * Returns the base URL from the given URL.
 *
 * @example
 * getBaseUrlFromUrl("https://example.com/index.html#/settings/something/else")
 * returns "https://example.com/index.html"
 */
export function getBaseUrlFromFeatureBranchUrl(url: string) {
  const [urlBase, rest] = url.split("index.html");
  if (!rest) {
    return url;
  }
  return urlBase + "index.html";
}
