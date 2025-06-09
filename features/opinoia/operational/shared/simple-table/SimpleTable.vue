<template>
  <!-- its a wrapper component thats why we need to ignore `Web:S5256` for sonar-->
  <!-- eslint-disable-next-line -->
  <!-- //NOSONAR --><table class="simple-table table-auto border-separate border-spacing-0 text-md">
    <slot />
  </table>
</template>

<style lang="scss">
/* stylelint-disable no-descending-specificity */
.simple-table {
  th,
  td {
    @apply text-left;

    // common font settings
    @apply text-sm;

    // common padding
    @apply p-2;

    // common borders rules
    @apply border-neutral-60;
  }

  th {
    @apply text-primary-110 font-semibold;

    // header padding
    @apply py-3;

    // header borders rules
    @apply border-t border-r;

    &:first-of-type {
      @apply rounded-tl-lg border-l;
    }

    &:last-of-type {
      @apply rounded-tr-lg;
    }
  }

  td {
    @apply font-normal;
  }

  // rows borders rules
  tr {
    td {
      @apply border-t border-r;

      &:first-of-type {
        @apply border-l;
      }
    }

    &.error {
      td {
        @apply border-t-error-100;

        &:first-of-type {
          @apply border-l-error-100;
        }

        &:last-of-type {
          @apply border-r-error-100;
        }
      }

      /**
       * to avoid double borders (due to the fact that we need border-separate for rounded corners),
       * rows draws only their upper border (except for the last one).
       * so for .error rows we need to set the top
       * border color of the following row as well
       */
      & + tr {
        td {
          @apply border-t-error-100;
        }
      }
    }

    &:last-of-type {
      td {
        @apply border-b;

        &:first-of-type {
          @apply rounded-bl-lg;
        }

        &:last-of-type {
          @apply rounded-br-lg;
        }
      }

      &.error {
        td {
          @apply border-b-error-100;
        }
      }
    }
  }

  // draw rounded corners on header if table has no rows
  &:not(:has(tbody > tr)) {
    th {
      @apply border-b;

      &:first-of-type {
        @apply rounded-bl-lg;
      }

      &:last-of-type {
        @apply rounded-br-lg;
      }
    }
  }
}
</style>
