# [short title of solved problem and solution]

- Status: Proposed
- Deciders: FE Team
- Date: 2024-09-17

## Context and Problem Statement

We need to implement user roles in the application. The application needs dynamically change it's features and logic based on this role. The implementation of this feature creates a substantial need to refactor many places of the application, primarily the experience flows forms (raw, curation, etc).

The biggest problem is the dynamic navigation and validation. Some users may see some sections, some may see some sections as readonly, etcetera. The application does not support dynamic navigation and validation.

## Decision Drivers <!-- optional -->

- Implement the requested user roles capabilities
- Standardize the logic for experience forms (form stores), so the validation and navigation can be dynamic
- Centralize the business logic
- Compartmentalize UI components

## Decision Outcome

We decided to approach the problem in 4 steps:

- Increase integration testing: until we implement the roles system, there should be no changes to the end application. We may need to increase the coverage of our integration tests.
- Start refactoring the flows and experiences piece by piece ("Strangling fig" approach), keeping retro-compatibility and keeping the surface of our changes as small as possible
- Implement a roles system that supports the requested features.

### Positive Consequences <!-- optional -->

- Better standards (centralized logic, separation of concerns, slim components, standardized interfaces for stores)
- Increased testing coverage
- Simpler logic

### Negative Consequences <!-- optional -->

- Added complexity
- Dynamic flows are harder to test

## Proposed APIs

### Standardized stores for form sections

Due to the dynamic nature of the proposed changes, we need to build and validate an experience at runtime. To do this we should have a common interface for the stores we use to store and validate the form data. This is a proposal of a standard store interface:

```ts
interface StandardFormStore {
  isValid: boolean;
}

const useSettingsStore = defineStore("settingsStore", () => {
  const isValid = computed(() => {
    // your logic here...
    return true;
  });
});
```

That's it! At the moment we only need to check if a form is valid. Those forms are then composed in a master "_flow store_":

```ts
const experienceRawStore = defineStore("experienceRawStore", () => {
  const stores = [useSettingsStore(), useLocationStore(), useContentStore()];

  const canSave = computed(() => stores.map((s) => s.isValid));
});
```

**UPDATE 1** : We may also need an API to check the validity/state of a single field, for example:

```ts
const isTitleValid = settingsStore.isFieldValid("title");
const isTitleRequired = settingsTore.isFieldRequired("title");

const navigationBarTickState = () => {
  // compute the nav left bar tick state (green/empty, required/non-required, hasChanges)
};
```

### User roles and capabilities

We will implement our own, decoupled role capability mapping in the FE. This decision with was taken with ARCH as not to couple us too tightly with the backend. It's a bit more work to keep the roles synced across the stack, but it will enable us to be more flexible, as the FE entities are not 1-1 with the BE ones.

Example mapping (NOTE: this is a WIP proposal, open to discussion):

```ts
const novaRoles = {
  NOVA_ADMIN: [
    {
      key: "experience_raw",
      claims: ["canRead", "canEdit", "canView", "canDelete", "canPublish"],
    },
    {
      key: "experience_raw_settings",
      claims: ["canRead", "canEdit", "canView", "canDelete"],
    },
    {
      key: "experience_raw_content_creation",
      claims: ["canRead", "canEdit", "canView", "canDelete"],
    },
    // ... etc
  ],
  SUPPLIER_USER: [
    {
      key: "experience_raw",
      claims: ["canRead", "canEdit", "canView"],
    },
    {
      key: "experience_raw_settings",
      claims: ["canRead", "canView"],
    },
    // etc...
  ],
};
```

and how we would consume it:

```ts
function getUserClaims(key: string) {
  const userRole = authStore.userRole;

  return novaRoles[userRole][key];
}

// *** inside a "flow" store

const userCapability = getUserClaims("experience_raw");

const userSections = computed(() => userCapability.filter((claims) => claims.includes("canView")));

const canSave = computed(() => userCapability.includes("canSave"));
const canPublish = computed(() => userCapability.includes("canPublish"));

// etc...

// *** inside a "form" store
const userCapability = getUserClaims("experience_raw_settings");

const isReadonly = computed(() => userCapability.includes("canEdit"));

// etc...
```

## Links

- Example MR for the first refactor: https://source.tui/dx/offer/content/nova/-/merge_requests/1037

<!-- markdownlint-disable-file MD013 -->
