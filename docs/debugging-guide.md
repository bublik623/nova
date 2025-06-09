# Debugging guide

> Note: this guide will be expanded once Datadog monitoring will be put in place

## Getting the version of the deployed app

We use [Gitlab CI/CD variables](https://docs.gitlab.com/ee/ci/variables/#predefined-cicd-variables) to get the pipeline id when building the app, and we store it in the `<head>` of the rendered HTML. This way we are able to indentify the version of the app that is currently deployed.

```ts
// nuxt-config.ts
app: {
    head: {
      meta: [{ name: "pipeline-id", content: process.env.CI_PIPELINE_ID }],
    },
  },
```

```yaml
# gitlab-ci.yml
script:
  - CI_PIPELINE_ID=$CI_PIPELINE_ID npm run build
```

To get the version, inspect the HTML of Nova in the desired environment (for example https://nova-test.tui-mm.com/). You will find the `pipeline-id` in a `<meta>` tag inside the `<head>` of the HTML:

```html
<head>
  ...
  <meta name="pipeline-id" content="1604100" />
</head>
```

Copy the ID, and navigate to this URL:

https://source.tui/dx/offer/content/nova/-/pipelines/{id} (replace {id} with the correct ID)

From this page you'll be able to access the Merge Request associated with this pipeline, and you'll be able to see all the changes that have been deployed with that MR.

## Check user sessions and error logs

We record user sessions with [Datadog](https://www.datadoghq.com/) RUM. You can check past sessions [here](https://app.datadoghq.com/rum/explorer?query=%40type%3Asession%20%40application.id%3A0884692d-b516-4019-898f-58b23d9c95ba&cols=&from_ts=1681302575331&to_ts=1681306175331&live=true).

Note: Make sure to use the filters to visualize logs for the desired environment and timespan.
