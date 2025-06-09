# Environment setup

[[_TOC_]]

## Environment variables

You can see all environment variables in the `nuxt.config.ts` file.

These are [runtime config](https://nuxt.com/docs/guide/going-further/runtime-config) variables, and they are accessed like so:

```ts
const runtimeConfig = useRuntimeConfig();

console.log(runtimeConfig.apiSecret);
console.log(runtimeConfig.public.apiBase);
```

These variables are overwritten for testing purposes in Playwright tests, using the `.env.playwright` file found in the root of the project.

## Setup

**It's necessary for all commands described [here](./commands-scripts.md).**

1. Install dependencies:

```bash
npm install
```

**Note:** Make sure to use the same node version declared in `.nvmrc`. To check your current node version, run:

```bash
node --version
```

If you're using [NVM](https://github.com/nvm-sh/nvm), you can just run:

```bash
nvm use
```

to set the current node version to the correct one.

## Tools

### IDE

[Visual Studio Code](https://code.visualstudio.com/) is the IDE used by the team.

The following extensions are recommended:

- [Vitest](https://marketplace.visualstudio.com/items?itemName=ZixuanChen.vitest-explorer)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [SonarLint](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits)
- [Gitlab Workflow](https://marketplace.visualstudio.com/items?itemName=GitLab.gitlab-workflow)
- [YAML Language Support](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

### Utilities

- [Brew](https://brew.sh/) (for Mac OS users)
- [Git](https://git-scm.com/downloads)
- [NVM](https://github.com/nvm-sh/nvm)
- [Docker](https://www.docker.com/products/docker-desktop/)
