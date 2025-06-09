import { useAuthStore } from "@/features/auth/useAuthStore";
import { datadogRum } from "@datadog/browser-rum";

// The auth plugin must be registered before any other plugin to not pollute data.
// It was already doing that thanks to the alphabetical ordering registration,
// but it might be  better to make it explicit.
// https://nuxt.com/docs/guide/directory-structure/plugins#plugin-registration-order
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();
  const { DISABLE_LOGIN: isLoginDisabled, MAINTENANCE: isMaintenanceEnabled } = config.public;

  if (isLoginDisabled || isMaintenanceEnabled) {
    return;
  }

  const auth = useAuthStore();

  try {
    // todo remove this when refactoring OFF-3664
    if (window.location.href.includes("nova-dx-offer-content")) {
      console.log("[NOVA] [SSO_PROXY] skipping authentication");
      return;
    } else {
      datadogRum.addAction("authentication.attempt_start");
      const tokenResult = await auth.login();
      auth.setToken(tokenResult);
      datadogRum.addAction("authentication.attempt_succeeded");
    }
  } catch (error) {
    datadogRum.addError("authentication.attempt_failed");

    throw createError({ message: "auth", cause: "JWT_TOKEN" });
  }
});
