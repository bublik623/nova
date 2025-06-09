# Commands & Scripts

[[_TOC_]]

⚠️ Make sure to [setup your environment](docs/environment-setup.md) before to run commands and script

⚠️ All commands below are relative to local environment, not CI pipelines.

---

## Run the app

### Run development app

Run the development server:

```bash
npm run dev
```

Go to https://localhost:3000/

### Performance issues in `nuxt@3.11.1`

If you notice a performance degradation while running the development server after this merge request, consider executing it with the `--no-fork` flag:

```bash
npm run dev -- --no-fork
```

Dependency re-optimizations: Optimizing dependencies - Nuxt 3.8.1
Development server performance: nuxi dev causes requests to stay "Pending"
Running the development server with the `--no-fork` flag (`npm run dev -- --no-fork`) improved the performance and seemed to resolve the dependency re-optimization issue.

### Run production app

Create the production bundle:

```bash
npm run build
```

After, in a separate shell, run:

```bash
node .output/server/index.mjs
```

---

## Run tests

### Run unit tests

You can run the unit test once:

```bash
npm run test:unit
```

or in watch mode

```bash
npm run test:unit:watch
```

You can only run specific tests, by specifying the filename (or a part of the name):

```bash
npm run test:unit Sidebar
```

To view the test coverage, just run:

```bash
npm run test:unit:coverage
```

or, for a single test file:

```bash
npm run test:unit:coverage Sidebar
```

### Run integration tests

In order to run the integration tests, you need to launch the dev server with a specific environment configuration (animations disabled, etc), you can do so by running:

```bash
npm run dev:test
```

> If you want to change the configuration, take a look at `.env.playwright`. Remember to restart the server to apply the changes.

Then, in another terminal window, you can run all integration tests with:

```bash
npm run test:integration
```

or you can specify a single test file:

```bash
npm run test:integration part-of-the-name
```

You can also debug the tests with:

```bash
npm run test:integration -- --debug
```

or simply run them in headed mode to see the browser in action

```bash
npm run test:integration -- --headed
```

### Run Lighthouse tests

_TBD_

---

## Lint the code

To validate JS (`npm run eslint`) and SASS/CSS files (`npm run stylelint`) run:

```bash
npm run lint
```

---

## Update the [Architectural Decision Log](adr/index.md)

```bash
npm run adr
```

---

## Generate / Update Typescript types from API

If you want to generate the models based on the API definition file stored on the [OpenApi specifications](https://source.tui/dx/architecture/open-api-specifications/-/tree/master/) repository, you can run:

```sh
npm run generate:all
```

To re-generate the types for a specific service, you can run:

```sh
npm run generate:name-of-the-service
```

---

## Fetch / Update the API Definitions

If you want to only download the last API definition without generate the types, run the command

```sh
npm run get-api:name-of-the-service
```

To download all openapi files, run:

```sh
npm run get-api:all
```

We store all openapi documents under `docs/api/**.yaml`.
