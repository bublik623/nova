<template>
  <div class="grid gap-2">
    <h1>Roles</h1>

    <pre>
      {{ currentRoles }}
    </pre>
    <pre>{{ currentPermissions }}</pre>

    <div>
      <NovaButton @click="test">Test</NovaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { hasPermission } from "@/features/roles/lib/has-permission";
import { usePermissionsStore } from "@/features/roles/stores/usePermissionsStore";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";

const { currentRoles, currentPermissions } = storeToRefs(usePermissionsStore());

function test() {
  if (hasPermission("experience.raw.canWrite")) {
    alert("has permission");
  } else {
    alert("no permission");
  }
}
</script>
