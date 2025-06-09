import { useConfigcat } from "@/features/core-shared/composables/useConfigCat";
import { isFeatureBranchUrl } from "@/features/sso-proxy/sso-proxy-utils";

export type FeatureFlagConfig = {
  [key: string]: {
    // environments
    localhost: boolean; // flag status for localhost environment
    test: boolean; // flag status for test environment
    pre: boolean; // flag status for pre-production environment
    prod: boolean; // flag status for production environment
  };
};

/**
 *  this object is used by useFeatureFlag to determine if a feature is enabled or not
 *  you can edit this object to enable or disable feature flags for different environments
 */
export const featureFlagConfig = {
  example: {
    localhost: true,
    test: true,
    pre: true,
    prod: false,
  },
} as const satisfies FeatureFlagConfig;

type LocalFeatureFlagNames = keyof typeof featureFlagConfig;
/**
 *
 */
/**
 * This function is used to check if a feature flag is enabled or not.
 * It checks the route query to determine if the feature is enabled.
 *
 * IMPORTANT: Use `useFeatureFlag` for efficient feature management, integrating both remote and local flags
 * to ensure feature consistency across environments.
 *
 * @param flagName - The name of the feature flag to check.
 *
 * @example
 * // To use this function to check if a feature flag "show-asterix" is enabled or not
 * const isFeatureEnabled = useFeatureFlag("show-asterix");
 *
 * @returns {(boolean|undefined)} - Returns true if the feature is enabled, false if disabled,
 * or undefined if the feature flag is not explicitly configured.
 */
function useLocalFeatureFlag(flagName: LocalFeatureFlagNames): boolean | undefined {
  const flagConfig = featureFlagConfig[flagName];
  if (!flagConfig) {
    return undefined;
  }

  const route = useRoute();
  const hostname = window.location.hostname;

  let isFeatureEnabled = false;

  if (hostname.includes("localhost")) {
    isFeatureEnabled = flagConfig.localhost;
  } else if (hostname.includes("nova.test.")) {
    isFeatureEnabled = flagConfig.test;
  } else if (hostname.includes("nova.pre.")) {
    isFeatureEnabled = flagConfig.pre;
  } else if (hostname.includes("nova.tui-mm")) {
    isFeatureEnabled = flagConfig.prod;
  }

  return isFeatureEnabled || flagName in route.query;
}

export type RemoteFlagNames =
  | "MAINTENANCE"
  | "adv_search_editorial_status_filter"
  | "editorial_adv_search_export_enabled"
  | "raw_adv_search_export_enabled"
  | "show_action_view_version_history"
  | "enableDifferentProductTypes"
  | "curation_level"
  | "enable_product_type_asx"
  | "enable_product_type_sip"
  | "enable_product_type_opinoia"
  | "pax_enabled"
  | "enable_pickup_page"
  | "enable_experience_locks";

/**
 * Retrieves the value of the specified remote flag from configcat.
 *
 * This function will throw an error if the flag value
 * is not of type boolean (or undefined) to enforce strict type checking.
 *
 * IMPORTANT: Use `useFeatureFlag` for efficient feature management, integrating both remote and local flags
 * to ensure feature consistency across environments.
 *
 * @param {RemoteFlagNames} flagName - The name of the remote flag.
 * @returns {(boolean | undefined)} The value of the remote flag.
 */
function useRemoteFeatureFlag(flagName: RemoteFlagNames): boolean | undefined {
  const { configCatClient } = useConfigcat();

  const flagValue = configCatClient?.snapshot()?.fetchedConfig?.settings[flagName]?.value;

  if (typeof flagValue != "boolean" && typeof flagValue !== "undefined") {
    throw new Error(`the type of the flag '${flagName}' is not supported, we support only booleans`);
  }
  return flagValue;
}

type FlagNames = RemoteFlagNames | LocalFeatureFlagNames;

/**
 * Retrieves the value of the specified flag, searching first among remote flags and then among local ones.
 * If the flag is not found among either remote or local flags, logs an error and returns a default value.
 *
 * note 1: by default, all feature flags but maintenance mode are enabled in vitest and playwright(test files)
 * note 2: also all feature flags are enabled for preview environments(feature branches)
 *
 * @param {FlagNames} flagName - The name of the feature flag to search for.
 * @param {boolean} [defaultValue=false] - The default value to return if the feature flag is not found. This parameter is optional and defaults to false.
 * @returns {(boolean)} The value of the feature flag if found; otherwise, returns the specified default value.
 */
export function useFeatureFlag(flagName: FlagNames, defaultValue: boolean = false): boolean {
  const config = useRuntimeConfig();
  const { APP_ENV: currentEnv } = config.public;
  const isMaintenanceFlag = flagName === "MAINTENANCE";

  if (import.meta.env.MODE === "test" || isFeatureBranchUrl()) {
    return !isMaintenanceFlag;
  }

  const remoteFlag = useRemoteFeatureFlag(flagName as RemoteFlagNames);
  if (remoteFlag != undefined) {
    return remoteFlag;
  }

  // TODO remove this. jira: OFF-4341
  if (currentEnv === "playwright") {
    return !isMaintenanceFlag;
  }

  const localFlag = useLocalFeatureFlag(flagName as LocalFeatureFlagNames);
  if (localFlag != undefined) {
    return localFlag;
  }

  // eslint-disable-next-line no-console
  console.error(`unable to find the value of the feature flag '${flagName}', returning the default value`);
  return defaultValue;
}
