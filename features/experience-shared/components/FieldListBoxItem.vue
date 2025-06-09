<template>
  <li class="flex justify-between items-center" data-testid="list-item">
    <div class="flex flex-wrap gap-0 flex-grow text-sm items-baseline font-normal py-2.5" data-testid="item-label">
      <slot />
    </div>
    <slot name="actions" />
  </li>
</template>
