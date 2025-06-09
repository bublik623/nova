# Datadog Integration

We initialize the [Datadog RUM](https://www.datadoghq.com/product/real-user-monitoring/) service as a client-only Nuxt plugin in `plugins/datadog.client.js`

You can use the Datadog SDK by importing it:
```js 
import { datadogRum } from "@datadog/browser-rum"
```

By itself the Datadog RUM service gathers an sizeable amount of data:

- User sessions and generic interactions (ie: clicking links)
- Application errors _(of which there are none, obviously)_
- Requests timing
- Generic application performance
- Route navigation

You can read more in this [intro](https://www.datadoghq.com/blog/real-user-monitoring-with-datadog/).

One of the main features of RUM is the ability to add custom tracking events. You must supply a event identifier (key), and you can also pass an additional parameter object.

In this example, we monitor what tabs are closed and opened by the user and their path:

```js
// stores/document-tabs.ts
addTab(tab: DocumentTab) {
    //...
    this.tabs.push(tab);
    datadogRum.addAction("DOCUMENT_TAB_ADD", tab);
},
closeTab(path: DocumentTab["path"], removeTab = true) {
    //...
    if (removeTab) {
        this.tabs = this.tabs.filter((tab) => tab.path !== path);
        datadogRum.addAction("DOCUMENT_TAB_CLOSE", {
            path,
        });
    }
},
```

You can also add an action with an HTML data attribute. Here we track when the user clicks "Create new experience" in the application dashboard:

```js
// pages/index.vue
<NovaButton
    size="sm"
    class="Dashboard__button"
    data-dd-action-name="Create raw content"
    @click="$router.push('/experience-raw/new')"
>
    <p class="Dashboard__button__text">
    {{ $t("dashboard.btn.create.new.raw.content") }}
    </p>
</NovaButton>
```

Read more [here](https://docs.datadoghq.com/real_user_monitoring/browser/tracking_user_actions/#action-attributes).
