# Naming Convention

## Commits

The project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Branches

Branches should be named as `xxx/yyy-zzz` 
- `xxx` : type of the branch (feature, hotfix, chore)
- `yyy` : related JIRA Card ID or GitLab Issue ID
- `zzz` : short description of the change/feature/fix

Examples:
- `feature/ma-156-pwa-assets` for JIRA card `MA-156`
- `chore/32-improve-performance-score` for GitLab issue `#32`
- `chore/increase-test-coverage` if there are not any related JIRA Card or GitLab Issue

## Merge Requests

Merge Requests name follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification 

```
<type>[optional scope]: <description>
```

where the `optional scope`:
- will be the related JIRA card ID or GitLab issue ID
- can be removed if there are not any related JIRA card or GitLab issue

Examples:
- `feat(ma-156): pwa assets for each white label` for JIRA card `MA-156`
- `chore(32): improve performance score (TTI+TBT)` for GitLab issue `#32`
- `test: increase test coverage` if there are not any related JIRA card or GitLab issue

## Components, stories and tests

* The project's structure should follow [Nuxt 3 standards](https://v3.nuxtjs.org/).
* Vue files must follow the official [Vue Styleguide](https://v2.vuejs.org/v2/style-guide/?redirect=true#Component-files-strongly-recommended)
* Tests must have the suffix `.test.ts`
* Components are grouped in sub-directories based on feature:
```
components
├── App
│   └── AppHeader
│       ├── AppHeader.vue
│       └── AppHeader.test.ts
└── Document
    └── FormSection
        ├── FormSection.vue
        └── FormSection.test.ts
```

## UI Kit

* All components that are part of [Nova Design System](https://www.figma.com/file/2Bwsy4uf5JJYhT78M84Olq/NOVA-Library) should be placed under `ui-kit`.
* All component should have the `Nova` prefix. For example: `NovaButton`, `NovaLabel`, etc.
* All component files should be in the same folder (`Component.ts`, `Component.test.ts`, `Component.stories.ts`)
* The file name should be structured as `PrefixBaseVariant` pattern, for example:
  - NovaSelect
  - NovaSelectSearch
  - NovaInputText
  - NovaInputRadio
  - NovaButton
  - NovaButtonIcon
