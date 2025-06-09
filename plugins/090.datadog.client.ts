// this plugin is registered as first so we can track the authentication in datadog
import { datadogRum } from "@datadog/browser-rum";
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const env = config.public.DATADOG_ENV as string;

  datadogRum.addAction("datadog.init");

  if (!config.public.DISABLE_DATADOG) {
    const sessionSampleCfg: Record<string, number> = {
      dev: 100,
      test: 100,
      pre: 50,
      prod: 100,
      default: 10,
    };

    const sessionReplaySampleCfg: Record<string, number> = {
      dev: 0,
      test: 0,
      pre: 0,
      prod: 100,
      default: 0,
    };

    datadogRum.init({
      applicationId: "0a154337-fb3a-4691-828d-3fa74eb0633e",
      clientToken: "pub2a22a6fd918b4e0c7a0ec1cba101d925",
      site: "datadoghq.eu",
      service: "nova-frontend",
      env,
      version: config.public.VERSION,
      sessionSampleRate: sessionSampleCfg[env] || sessionSampleCfg.default,
      sessionReplaySampleRate: sessionReplaySampleCfg[env] || sessionReplaySampleCfg.default,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
    });

    datadogRum.startSessionReplayRecording();
  }
});
