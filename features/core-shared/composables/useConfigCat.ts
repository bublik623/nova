import * as configcat from "configcat-js";

let configCatClient: configcat.IConfigCatClient | null = null;

export function useConfigcat() {
  const config = useRuntimeConfig();
  const { CONFIGCAT_SDK_KEY } = config.public;

  if (!configCatClient) {
    configCatClient = configcat.getClient(CONFIGCAT_SDK_KEY, configcat.PollingMode.AutoPoll, {
      pollIntervalSeconds: 60,
    });
  }

  return {
    configCatClient,
  };
}
