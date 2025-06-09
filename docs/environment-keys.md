## Environment Keys

This documentation explains the environment keys used in the frontend
application. Environment keys are stored in environment files located in
the `root/env` folder.

### Environment Files

The following environment files are used by this application:

- `.env.local`: Used for the local development environment.
- `.env.playwright`: Used for the Playwright testing environment.
- `.env.test`: Used for the development environment.
- `.env.pre`: Used for the PRE environment.
- `.env.prod`: Used for the production environment.

Each environment file contains key-value pairs that are used to configure
the application for a specific environment. The environment file that is
used depends on the environment in which the application is running.

### Usage

The environment keys can be accessed in the application using the
`useRuntimeConfig` composable. For example, if the environment file contains
`BASE_URL=http://localhost:3000`, the base URL can be accessed in
the application using:

```ts
const config = useRuntimeConfig();
console.log(config.public.BASE_URL);
```

### Adding a New Environment Variable

If you want to add a new environment variable, you need to modify the
corresponding environment file and then update the `runtimeConfig` object
in the `nuxt.config.ts` file to expose the new variable to the client-side
code. Here's an example of how to add a new environment variable called
`NEW_VARIABLE`:

1. Add `NEW_VARIABLE=value` to the appropriate environment file.
2. In `nuxt.config.ts`, add `NEW_VARIABLE: process.env.NEW_VARIABLE` to
   the `runtimeConfig` object:

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      NEW_VARIABLE: process.env.NEW_VARIABLE,
    },
  },
});
```

This will expose `NEW_VARIABLE` to the client-side code as
`config.public.NEW_VARIABLE`.

### Scripts

The following `package.json` scripts are used to run and build the
application with specific environment files:

- `"dev": "nuxt dev --dotenv env/.env.local"`: Runs the application in
  the local development environment using the `.env.local` environment
  file.
- `"build:env:prod": "nuxt build --dotenv env/.env.prod"`: Builds the
  application for production using the `.env.prod` environment file.

see package.json for more details.
