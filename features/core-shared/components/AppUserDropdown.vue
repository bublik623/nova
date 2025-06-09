<script setup lang="ts">
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { validRoles } from "@/features/roles/lib/schema";

const { logout, userName, userRoles } = useAuthStore();
const { $t } = useNuxtApp();

const showDropdown = ref(false);
const component = ref(null);

const initialLetter = userName ? userName[0].toUpperCase() : "";
const mappedRoles = computed(() => mapUserRoles(userRoles));

const mapUserRoles = (rolesList?: string[]) => {
  if (!rolesList) {
    return "";
  }

  // removing all the Roles not valid in NOVA
  const novaRoles = rolesList.filter((role) => validRoles.safeParse(role).success);
  const translatedRoles = novaRoles.map((roleKey) => $t(`role-${roleKey}`));
  return translatedRoles.join(", ");
};

useDetectClickOutside(component, () => {
  showDropdown.value = false;
});
</script>

<template>
  <div ref="component" class="relative">
    <button
      :aria-expanded="showDropdown"
      aria-haspopup="true"
      aria-label="Open user menu"
      data-testid="user-dropdown-toggle"
      class="w-[24px] h-[24px] border rounded-full grid place-content-center bg-primary-10 cursor-pointer relative hover:bg-primary-20 select-none"
      :class="{ 'bg-primary-20': showDropdown }"
      @click="showDropdown = !showDropdown"
      @keydown.esc="showDropdown = false"
    >
      <span class="select-none">
        {{ initialLetter }}
      </span>
    </button>

    <div
      v-show="showDropdown"
      data-testid="user-dropdown-menu"
      class="absolute top-[30px] right-0 border min-w-[164px] rounded-lg border-neutral-60 shadow-popover bg-white text-xs font-normal"
    >
      <ul>
        <li class="flex items-start p-2 rounded-t-lg">
          <NovaIcon :size="18" name="user" class="mr-1 shrink-0" />
          <div>
            <div>{{ userName }}</div>
            <div class="text-text-80">{{ mappedRoles }}</div>
          </div>
        </li>
        <li>
          <button
            aria-label="Logout User"
            data-testid="user-dropdown-item-logout"
            class="flex items-center p-2 w-full hover:bg-neutral-20 rounded-b-lg"
            @click="logout"
          >
            <NovaIcon :size="18" name="logout" class="mr-1 shrink-0" />
            <span>{{ $t("common.logout") }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
