import { acceptHMRUpdate, defineStore } from "pinia";
import {
  login as cognitoLogin,
  CognitoTokenResponseModel,
  logout as cognitoLogout,
  getTokenProperties,
  verifyTokenExpiration,
  getStoredToken,
} from "@dx/user-login-library";
import { useMemoize, useThrottleFn } from "@vueuse/core";
import { getSSOProxyUrl } from "../sso-proxy/sso-proxy-utils";

export interface AuthState {
  token: CognitoTokenResponseModel | null;
}

interface TokenProperties {
  sub?: string;
  roles?: string;
  name?: string;
}

export const useAuthStore = defineStore("auth-store", () => {
  const state = ref<AuthState>({
    token: null,
  });

  const loggedIn = computed(() => !!state.value.token);
  const bearerToken = computed(() => state.value.token?.id_token);
  const config = useRuntimeConfig();

  const isLoginDisabled = config.public.DISABLE_LOGIN; // disable login for integration tests

  const setToken = (value: CognitoTokenResponseModel | null) => {
    state.value.token = value;
  };

  const userUuid = computed<string | undefined>(() => {
    if (bearerToken.value) {
      const tokenProperties = getTokenProperties<TokenProperties>("sub");
      return tokenProperties?.sub;
    } else {
      return undefined;
    }
  });

  /**
   * login with cognito
   */
  const login = async () => {
    const tokenResponse = await cognitoLogin(config.public.COGNITO_CLIENT_ID, config.public.APP_ENV as any, {
      redirectUrl: getSSOProxyUrl(),
    });
    return tokenResponse;
  };

  const logout = () => {
    setToken(null);
    cognitoLogout();
  };

  // can be called once (for axios interceptors)
  const logoutOnce = useMemoize(() => logout());

  // can be called 1 time per 10 seconds
  const verifyToken = useThrottleFn(() => {
    verifyTokenExpiration();
    const newToken = getStoredToken();
    return newToken;
  }, 10000);

  const $reset = () => {
    state.value.token = null;
  };

  // Roles and permissions

  const userRoles = computed<string[]>(() => {
    // hardcode nova_admin for the integration tests
    if (isLoginDisabled) {
      return ["nova_admin"];
    }

    if (bearerToken.value) {
      const tokenProperties = getTokenProperties<TokenProperties>("roles");
      return tokenProperties.roles?.split(",").map((r) => r.trim()) || [];
    } else {
      return [];
    }
  });

  const userName = computed<string | undefined>(() => {
    if (bearerToken.value) {
      const tokenProperties = getTokenProperties<TokenProperties>("name");
      return tokenProperties.name;
    } else {
      return undefined;
    }
  });

  return {
    bearerToken,
    loggedIn,
    userUuid,
    setToken,
    login,
    logout,
    logoutOnce,
    verifyToken,
    $reset,
    userRoles,
    userName,
  };
});

// helpers

export type UseAuthStore = ReturnType<typeof useAuthStore>;

// HMR
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
