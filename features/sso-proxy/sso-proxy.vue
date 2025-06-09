<script setup lang="ts">
import { getUrlFromState } from "@dx/user-login-library";
import { getBaseUrlFromFeatureBranchUrl } from "./sso-proxy-utils";
definePageMeta({
  middleware(to) {
    try {
      const state = to.query.state as string;
      const code = to.query.code as string;
      const redirectUrl = getUrlFromState(state);
      const branchUrl = getBaseUrlFromFeatureBranchUrl(redirectUrl);
      const branchUrlWithAuthParams = `${branchUrl}?code=${code}&state=${state}`;
      window.location.href = branchUrlWithAuthParams;
    } catch (e) {
      console.error(e);
      showError({ cause: "SSO_PROXY", message: "Could'nt get the redirect url from the `state`" });
    }
  },
});
</script>

<template>
  <div>SSO Proxy</div>
</template>
