# Multilanguage

## How translations are used

In this project, we use translation keys to translate all application text (cta, menus, descriptions, placeholders, etc...). We currently support only the `en-GB` language by default.

## How to name translations?

- translation key MUST be lowercase, separated by `.` (e.g., `some.key`)
- translation key SHOULD use the page/component (e.g. `header`, `timeline`) as first value (e.g., `header.help.button`)
- annotate the value of the translation key (usually from Figma)

## How to add a translation to a template?

In `plugins/i18n.ts`, we have exposed [i18n Musement library](https://bitbucket.org/musementcom/i18n/src/master/) `trans` method as `$t` in the app context;

```ts
import axios from "axios";
import { loadCache, trans, TranslationOptions } from "@musement/i18n";

const lang = "en-GB";
const namespace = "b2b-nova-fe";

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  try {
    const { data } = await axios.get(`${config.public.I18N_BASE_URL}/i18n`, {
      params: { namespace, lang },
    });
    loadCache(data);
  } catch {
    console.error("Error while loading translation bundle.");
  }

  return {
    provide: {
      t: (id: string, options?: TranslationOptions) => trans(lang, namespace, id, options),
    },
  };
});
```

So you can use it:

- as `this.$t` in Vue components and Pinia stores:

  ```html
  <h1>{{ $t("timeline.welcome") }} Sara,</h1>
  ```

  ```html
  <script lang="ts" setup>
    const { $t } = useNuxtApp();
    console.log($t("SOME_KEY"));
  </script>
  ```

## How to add or update translations?

1. clone and open [weblate-translations](https://source.tui/dx/distribution/discovery/weblate-translations)
2. pull last version of master branch, install dependencies (`npm i`)
3. run CLI (`npm run cli`)
4. select `Add new translation keys to existing module`
5. as module, select `b2b-nova-fe`
6. select `N` for adding translations option
7. insert array of keys (e.g., `["some.key", "other.key"]` )
8. in order to add translation for English:

- repeat 3-5 steps,
- select `Y` for adding translations option
- select `en-GB` as a language
- insert array of objects (e.g., `[{key: "some.key", value: "some.value" }, {key: "other.key", value: "other.value"]`)

9. commit, adding reference to your JIRA ticket (e.g. `feat(OFF-XXXX): added keys for nova`)
10. push on `master` branch
11. you can check if your commit build is successful [here](https://source.tui/dx/distribution/discovery/weblate-translations/-/commits/master)
12. after some time you can check [here](https://fe-apiproxy.musement.com/i18n?namespace=b2b-nova-fe) your translation is online
13. create jira ticket on [MM-SEO board](https://jira.tuigroup.com/projects/SEO) about adding other translations for created keys (at the moment, NOVA only supports english so this is not needed)

## How to use Weblate panel?

Weblate panel is used for adding/editing translations for existing key. If for any reason you don't want to do it via code you can use [weblate panel of DFS](http://translate.musement.com/projects/website/dfs/). More details [here](https://confluence.tuigroup.com/display/PROD/Weblate+translations)

## How to use dynamic values inside translations?

1. Do the same steps as it is described [here](#how-to-add-or-update-translations) and put your variables between `%` signs e.g.:

```javascript
{ key: "some.key", value: "Welcome %name%, your booking ID is %booking% "}
```

2. To display translation in the template follow [these steps](#how-to-add-a-translation-to-a-template) and insert placeholders like:

```javascript
  $t("some.key"), {
    placeholders: {
      name: "Sarah",
      booking: "booking1234"
    }
  })
}
```
