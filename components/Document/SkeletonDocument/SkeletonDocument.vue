<template>
  <div class="SkeletonDocument" data-testid="skeleton">
    <div class="SkeletonDocument__Sidebar">
      <ul>
        <li class="skeleton_item" :style="{ width: '70%', height: '30px', marginTop: '23px' }" />
        <li class="skeleton_item" :style="{ width: '35%', height: '20px', marginTop: '15px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '33px', marginTop: '30px' }" />
        <li class="skeleton_item" :style="{ width: '50%', height: '25px', marginTop: '15px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '25px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '25px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '25px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '25px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '50%', height: '25px', marginTop: '20px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '25px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '25px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '25px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '25px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '25px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '50%', height: '25px', marginTop: '20px' }" />
        <li class="skeleton_item" :style="{ width: '100%', height: '25px', marginTop: '10px' }" />
      </ul>
    </div>
    <main class="SkeletonDocument__main">
      <ul>
        <li class="skeleton_item" :style="{ width: '20%', height: '30px', marginTop: '25px' }" />
        <li class="skeleton_item" :style="{ width: '25%', height: '20px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '38%', height: '30px', marginTop: '15px' }" />
        <li class="skeleton_item" :style="{ width: '24%', height: '30px', marginTop: '35px' }" />
        <li class="skeleton_item" :style="{ width: '39%', height: '20px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '21%', height: '20px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '35%', height: '30px', marginTop: '15px' }" />
        <li class="skeleton_item" :style="{ width: '20%', height: '30px', marginTop: '35px' }" />
        <li class="skeleton_item" :style="{ width: '35%', height: '20px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '25%', height: '20px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '90%', height: '170px', marginTop: '15px' }" />
        <li class="skeleton_item" :style="{ width: '35%', height: '20px', marginTop: '25px' }" />
        <li class="skeleton_item" :style="{ width: '25%', height: '20px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '20%', height: '30px', marginTop: '25px' }" />
        <li class="skeleton_item" :style="{ width: '25%', height: '20px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '38%', height: '30px', marginTop: '15px' }" />
        <li class="skeleton_item" :style="{ width: '24%', height: '30px', marginTop: '35px' }" />
        <li class="skeleton_item" :style="{ width: '39%', height: '20px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '21%', height: '20px', marginTop: '10px' }" />
        <li class="skeleton_item" :style="{ width: '35%', height: '30px', marginTop: '15px' }" />
        <li class="skeleton_item" :style="{ width: '90%', height: '170px', marginTop: '15px' }" />
        <li class="skeleton_item" :style="{ width: '35%', height: '20px', marginTop: '25px' }" />
        <li class="skeleton_item" :style="{ width: '25%', height: '20px', marginTop: '10px' }" />
      </ul>
    </main>
    <ul class="SkeletonDocument__action-bar">
      <li class="skeleton_item" :style="{ width: '50%', height: '20px', marginTop: '27px' }" />
      <li class="skeleton_item" :style="{ width: '100%', height: '20px', marginTop: '10px' }" />
      <li class="skeleton_item" :style="{ width: '100%', height: '40px', marginTop: '15px' }" />
      <li class="skeleton_item" :style="{ width: '50%', height: '20px', marginTop: '35px' }" />
      <li class="skeleton_item" :style="{ width: '100%', height: '20px', marginTop: '10px' }" />
      <li class="skeleton_item" :style="{ width: '100%', height: '40px', marginTop: '15px' }" />
    </ul>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.SkeletonDocument {
  display: grid;
  justify-items: start;
  grid-template-columns: auto 1fr auto;

  &__Sidebar {
    padding: 0 10px;
    border-right: 1px solid var(--color-grey-90);
    width: var(--document-sidebar-width-md);
  }

  &__main {
    padding: 0 10px;
    width: 100%;
  }

  &__action-bar {
    padding: 0 rem(20) 0 rem(60);
    width: rem(290);
    border-left: 1px solid var(--color-grey-90);
  }
}

@include start-from(desktop-lg) {
  .SkeletonDocument {
    &__Sidebar {
      width: var(--document-sidebar-width-lg);
    }
  }
}
</style>
