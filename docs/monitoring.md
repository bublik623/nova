# Monitoring

The monitoring tools used in the project are entirely hosted to Datadog.

## Datadog

### Real User Monitoring (RUM)

Datadog’s Real User Monitoring (RUM) gives you end-to-end visibility into the real-time activity and experience of individual users. The RUM application is available [here](https://app.datadoghq.com/rum/application/10b7af86-b8c6-443d-92b9-859cd51bad55/overview/browser?from_ts=1676993453463&to_ts=1677079853463&live=true) in Datadog.

The sample rating follows the company standard and it's available [here](https://confluence.tuigroup.com/pages/viewpage.action?spaceKey=TDIDS&title=Datadog+RUM). The applied rating is the following:

| Environment | Rule       | Sample Rate | Premium Sample Rate |
| ----------- | ---------- | ----------- | ------------------- |
| Test        | Always     | 100%        | 0%                  |
| Pre         | Always     | 50%         | 0%                  |
| Prod        | < 1 month  | 100%        | 10%                 |
|             | >= 1 month | 10%         | 0%                  |

### Nova dashboard

You can find our dashboard here: https://app.datadoghq.com/dashboard/hfq-aqt-5hr/nova-general-dashboard

## Hotjar

We also use Hotjar to record user sessions. You can find the application overview [here](https://insights.hotjar.com/sites/3457766/overview).

We use the environment variable `DISABLE_HOTJAR` to disable Hotjar in all environments except PROD.
