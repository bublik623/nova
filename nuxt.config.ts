import { resolve } from "path";
import svgLoader from "vite-svg-loader";
import { setRestrictFlowMiddleware } from "./utils/set-restrict-flow-middleware";

const isDev = process.env.NODE_ENV === "development";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  imports: {
    addons: {
      // We need to disable the auto import of vue functions inside the template
      // as the `vue.readonly` function will clash with our `readonly` prop.
      vueTemplate: false,
    },
  },

  typescript: {
    shim: false,
  },

  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "@hebilicious/vue-query-nuxt"],

  tailwindcss: {
    viewer: ["dev", "test"].includes(process.env.APP_ENV!),
  },

  ssr: false,

  router: {
    options: {
      hashMode: process.env.PUBLIC_PATH ? true : false, // this is needed for the sso-proxy
    },
  },

  app: {
    head: {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      meta: [
        { name: "pipeline-id", content: process.env.CI_PIPELINE_ID },
        { name: "release", content: "preview 2" },
      ],
    },
    baseURL: process.env.PUBLIC_PATH ?? "/", // this is needed for the sso-proxy
  },

  css: [
    "@/assets/css/tailwind.css",
    "@/assets/scss/fonts.scss",
    "@/assets/scss/globals.scss",
    "@/assets/scss/variables.scss",
  ],

  vite: {
    plugins: [svgLoader()],
  },

  vue: {
    compilerOptions: {
      // for the Auth feature
      isCustomElement: (tag) => tag === "uh-cognito-sso",
    },
  },

  vueQuery: {
    queryClientOptions: {
      defaultOptions: {
        queries: {
          staleTime: 5000,
          retry: process.env.CI ? false : 1,
        },
      },
    },
    vueQueryPluginOptions: {
      enableDevtoolsV6Plugin: true,
    },
  },

  hooks: {
    "pages:extend"(pages) {
      // dynamic agenda page for curation flow
      const agendaPage = {
        name: "experience-id-curation-agenda",
        path: "agenda",
        file: resolve("pages/experience/[id]/raw/agenda.vue"),
      };

      // extend curation pages
      const curationPages = pages.find((page) => {
        return page.name === "experience-id-curation";
      });
      curationPages?.children?.push(agendaPage);

      // todo remove this block when refactoring OFF-3664
      if (process.env.SSO_PROXY) {
        // Remove the default index page
        const indexPageIndex = pages.findIndex((page) => page.name === "index");
        if (indexPageIndex !== -1) {
          pages.splice(indexPageIndex, 1);
        }
        // Add sso-proxy as the new default page
        pages.unshift({ name: "sso-proxy", path: "/", file: resolve("features/sso-proxy/sso-proxy.vue") });
      }

      // adding the restrict flow middleware in all the child pages of the experience
      setRestrictFlowMiddleware(pages);
    },
  },

  runtimeConfig: {
    public: {
      APP_ENV: process.env.APP_ENV,
      COGNITO_DOMAIN: process.env.COGNITO_DOMAIN,
      COGNITO_REDIRECT_URI: isDev ? "http://localhost:3000" : process.env.COGNITO_REDIRECT_URI,
      COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
      CONTENT_COMMAND_SERVICE_BASE_URL: process.env.CONTENT_COMMAND_SERVICE_BASE_URL,
      CONTENT_ANALYTICS_SERVICE_BASE_URL: process.env.CONTENT_ANALYTICS_SERVICE_BASE_URL,
      CONTENT_MASTER_DATA_SERVICE_BASE_URL: process.env.CONTENT_MASTER_DATA_SERVICE_BASE_URL,
      CONTENT_QUERY_SERVICE_BASE_URL: process.env.CONTENT_QUERY_SERVICE_BASE_URL,
      EXPERIENCE_RAW_SERVICE_BASE_URL: process.env.EXPERIENCE_RAW_SERVICE_BASE_URL,
      EXPERIENCE_MASTER_DATA_SERVICE_BASE_URL: process.env.EXPERIENCE_MASTER_DATA_SERVICE_BASE_URL,
      METADATA_EXPERIENCE_SERVICE_BASE_URL: process.env.METADATA_EXPERIENCE_SERVICE_BASE_URL,
      CHARLIE_CONTENT_MASTER_DATA_SERVICE_BASE_URL: process.env.CHARLIE_CONTENT_MASTER_DATA_SERVICE_BASE_URL,
      OFFER_SERVICE_BASE_URL: process.env.OFFER_SERVICE_BASE_URL,
      INVENTORY_SERVICE_BASE_URL: process.env.INVENTORY_SERVICE_BASE_URL,
      PICKUP_PLACE_SERVICE_BASE_URL: process.env.PICKUP_PLACE_SERVICE_BASE_URL,
      PICKUP_EXPERIENCE_SERVICE_BASE_URL: process.env.PICKUP_EXPERIENCE_SERVICE_BASE_URL,
      CONTRACT_MASTER_DATA_SERVICE_BASE_URL: process.env.CONTRACT_MASTER_DATA_SERVICE_BASE_URL,
      SUPPLIER_ENROLLMENT_SERVICE_BASE_URL: process.env.SUPPLIER_ENROLLMENT_SERVICE_BASE_URL,
      DAM_SERVICE_BASE_URL: process.env.DAM_SERVICE_BASE_URL,
      GEO_MASTER_DATA_BASE_URL: process.env.GEO_MASTER_DATA_BASE_URL,
      SUPPLIER_ID: process.env.SUPPLIER_ID,
      I18N_BASE_URL: process.env.I18N_BASE_URL,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      MUS_APPLICATION_CLIENT: process.env.MUS_APPLICATION_CLIENT,
      REFRESH_TIMEOUT: process.env.REFRESH_TIMEOUT,
      WATCH_DEBOUNCE_TIMEOUT: process.env.WATCH_DEBOUNCE_TIMEOUT,
      RESIZE_OBSERVER_DEBOUNCE: process.env.RESIZE_OBSERVER_DEBOUNCE,
      DISABLE_DATADOG: parseBooleanEnv(process.env.DISABLE_DATADOG),
      DATADOG_ENV: process.env.DATADOG_ENV,
      DISABLE_ANIMATIONS: parseBooleanEnv(process.env.DISABLE_ANIMATIONS),
      DISABLE_LOGIN: parseBooleanEnv(process.env.DISABLE_LOGIN),
      DISABLE_HOTJAR: parseBooleanEnv(process.env.DISABLE_HOTJAR),
      VERSION: process.env.CI_PIPELINE_ID ?? "local",
      NOTIFICATION_TIMEOUT: process.env.NOTIFICATION_TIMEOUT,
      CONFIGCAT_SDK_KEY: process.env.CONFIGCAT_SDK_KEY,
    },
  },

  compatibilityDate: "2024-12-06",
});

function parseBooleanEnv(envVar: string | undefined): boolean {
  if (envVar == null) {
    return false;
  }

  if (!["true", "false"].includes(envVar)) {
    throw new Error("Variable to parse must either be 'true' or 'false'");
  }

  return envVar === "true";
}
