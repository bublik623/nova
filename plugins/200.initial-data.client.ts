import axios from "axios";
import { loadCache, trans, TranslationOptions } from "@dx/i18n";
import { useMasterData } from "@/stores/master-data";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { datadogRum } from "@datadog/browser-rum";
import { RuntimeConfig } from "nuxt/schema";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";

const lang = "en-GB";
const namespace = "b2b-nova-fe";

/**
 * Loads all data needed for the app, on page load
 */
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();
  const config = useRuntimeConfig();
  const { DISABLE_LOGIN: isLoginDisabled } = config.public;
  const isMaintenanceEnabled = useFeatureFlag("MAINTENANCE");
  const isAuthenticated = auth.loggedIn || isLoginDisabled;

  const loading = ref(true);
  const error = ref(false);

  // track the initialization time of the plugin
  const initTime = Date.now();
  const isInitialLoad = ref(false);

  if (isAuthenticated || isMaintenanceEnabled) {
    try {
      loading.value = true;
      await loadInitialData(config, isMaintenanceEnabled);
    } catch {
      error.value = true;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Signals the application is fully loaded to datadog, only if the page is not already loaded
   */

  function emitFullLoad() {
    if (isInitialLoad.value) {
      return;
    }

    const delta = Date.now() - initTime;

    datadogRum.addAction("app.loaded", {
      elapsedTime: delta,
    });

    isInitialLoad.value = true;
  }

  return {
    provide: {
      loadingInitialData: loading,
      errorLoadingInitialData: error,
      t: (id: string, options?: TranslationOptions) => trans(lang, namespace, id, options),
      emitFullLoad,
    },
  };
});

async function loadInitialData(config: RuntimeConfig, isMaintenanceEnabled: boolean) {
  const { getMasterData } = useMasterData();
  const { logError } = useLogger();

  datadogRum.addAction("initial_data.i18n.start");
  try {
    const { data } = await axios.get(`${config.public.I18N_BASE_URL}/i18n`, {
      headers: {
        "X-Musement-Application": config.public.MUS_APPLICATION_CLIENT,
      },
      params: { namespace, lang },
    });

    loadCache(data);
  } catch (error: any) {
    logError("load-i18n", error);
  } finally {
    datadogRum.addAction("initial_data.i18n.end");
  }

  if (!isMaintenanceEnabled) {
    try {
      datadogRum.addAction("initial_data.masterdata.start");
      await getMasterData();
    } catch (error) {
      logError("master-data", error);
    } finally {
      datadogRum.addAction("initial_data.masterdata.end");
    }
  }
}
