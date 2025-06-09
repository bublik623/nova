<template>
  <NovaAlert v-if="hasOptionWithAllAvailabilitiesExpired" status="error" class="mb-4">
    {{ $t("experience.options.availability.all_expired_warning") }}
  </NovaAlert>
  <NovaCheckbox
    v-if="hasOptionWithAtLeastOneExpiredAvailability"
    class="text-text-100"
    data-testid="hide-expired-availability-toggle"
    value="hide-expired-availabilities"
    :label="$t('experience.options.availability.hide-expired-availabilities')"
    :status="hideExpiredAvailabilities"
    @update:status="toggleExpiredAvailabilities"
  />
  <div v-for="option in filteredOptions" :key="option.id" class="mt-4" data-testid="experience-options-index-option">
    <NovaCollapse v-model="option.open.value" class="SingleOption" data-testid="option-details-collapsible">
      <template #title>
        <span>{{ option.name }}</span>
        <NovaLabel v-if="option.pricing_type_allowed === PricingDefinition.GROUP" class="ml-2" theme="solid-secondary">
          {{ $t("common.groups") }}
        </NovaLabel>
        <NovaLabel
          class="ml-2"
          data-testid="option-status"
          :data-status="option.status?.toLowerCase()"
          :theme="option.status === 'PUBLISHED' ? 'green' : 'yellow'"
        >
          {{
            option.status === "PUBLISHED"
              ? $t("experience.options.status.published")
              : $t("experience.options.status.draft")
          }}
        </NovaLabel>
      </template>
      <div class="p-4">
        <div>
          <span class="Info__key"> {{ $t("experience.option.duration.title") }}: </span>
          <span class="Info__value"> {{ option.humanizedDuration }}</span>
        </div>
        <div class="mt-2">
          <span class="Info__key"> {{ $t("experience.option.capacity.title") }}: </span>
          <span class="Info__value"> {{ option.humanizedCapacity }}</span>
        </div>

        <NovaCollapse
          :model-value="true"
          class="mt-4"
          :title="$t('experience.option.pricing.title')"
          size="md"
          data-testid="pricing-details-collapsible"
        >
          <SimpleTable class="PricingTable" caption="Pricing Recap Table">
            <template #header>
              <tr>
                <th scope="col">
                  {{ $t("experience.options.pricing.name") }}
                </th>
                <th scope="col">
                  {{
                    option.pricing_type_allowed === PricingDefinition.GROUP
                      ? $t("experience.options.pricing.group")
                      : $t("experience.options.pricing.holder")
                  }}
                </th>
                <th scope="col">
                  {{ $t("experience.options.pricing.price") }}
                </th>
              </tr>
            </template>
            <template #body>
              <tr v-for="(pricing, key) in option.pricings.value" :key="key">
                <td>{{ key }}</td>
                <td>
                  <ul class="PricingTable__list">
                    <li v-for="{ holder, age_range } in pricing" :key="holder">
                      {{ holder }}
                      <span class="PricingTable__detail">
                        {{ age_range.from }} -
                        {{ age_range.to }}
                      </span>
                    </li>
                  </ul>
                </td>
                <td>
                  <ul class="PricingTable__list">
                    <li v-for="{ holder, tiers } in pricing" :key="holder">
                      {{ tiers[0].retail_price }}
                    </li>
                  </ul>
                </td>
              </tr>
            </template>
          </SimpleTable>

          <template #actions>
            <NovaButtonIcon
              v-if="shouldShowEditButton"
              name="edit"
              shape="square"
              theme="dark"
              data-testid="pricing-table-reroute"
              @click.stop="$router.push(option.pricingPath)"
            />
          </template>
        </NovaCollapse>

        <NovaCollapse
          :model-value="true"
          class="mt-4"
          :title="$t('experience.option.availability.title')"
          size="md"
          data-testid="availability-details-collapsible"
        >
          <SimpleTable
            v-if="isCalendarEnabled"
            class="AvailabilityTable"
            caption="Availability Recap Table"
            data-testid="availability-recap-table"
          >
            <template #header>
              <tr>
                <th scope="col">
                  <TableSortButton
                    :active-sort-key="activeSortKey"
                    data-testid="sort-availabilities-by-name-btn"
                    :active-sort-direction="orderDirection"
                    own-sort-key="name"
                    @click="toggleDirectionOrder('name')"
                  >
                    <template #label>
                      {{ $t("experience.options.availability.name") }}
                    </template>
                  </TableSortButton>
                </th>
                <th scope="col">
                  <TableSortButton
                    :active-sort-key="activeSortKey"
                    data-testid="sort-availabilities-by-dates-btn"
                    :active-sort-direction="orderDirection"
                    own-sort-key="dates"
                    @click="toggleDirectionOrder('dates')"
                  >
                    <template #label>
                      {{ $t("experience.options.availability.dates") }}
                    </template>
                  </TableSortButton>
                </th>
                <th scope="col">
                  {{ $t("experience.options.availability.days") }}
                </th>
              </tr>
            </template>
            <template #body>
              <template v-if="option.availabilities.length > 0">
                <tr v-for="availability in option.availabilities" :key="availability.id">
                  <td>{{ availability.name }}</td>
                  <td>
                    <span class="mr-2"
                      >{{ isDateTimeTicket(availability) && parseDate(availability.date_range) }}
                    </span>
                    <AvailabilityExpiredLabel v-if="isExpired(availability)" data-testid="expired-availability-label" />
                  </td>
                  <td>
                    {{ isDateTimeTicket(availability) && parseDaysOfTheWeek(availability.days) }}
                  </td>
                </tr>
              </template>
              <template v-else>
                <div
                  data-testid="empty-expired-availabilities-placeholder"
                  class="w-full p-4 text-text-100 text-center"
                >
                  {{ $t("experience.options.availability.empty-availabilities") }}
                </div>
              </template>
            </template>
          </SimpleTable>
          <SimpleTable v-else class="AvailabilityTable" caption="Availability Recap Table">
            <template #header>
              <tr>
                <th scope="col">
                  <TableSortButton
                    active-sort-key="name"
                    data-testid="sort-availabilities-by-name-btn"
                    :active-sort-direction="orderDirection"
                    own-sort-key="name"
                    @click="toggleDirectionOrder('name')"
                    @update:active-sort-key="activeSortKey = $event"
                  >
                    <template #label>
                      {{ $t("experience.options.availability.name") }}
                    </template>
                  </TableSortButton>
                </th>
                <th scope="col">
                  {{ $t("experience.options.availability.expiration") }}
                </th>
              </tr>
            </template>
            <template #body>
              <template v-if="option.availabilities.length > 0">
                <tr v-for="availability in option.availabilities" :key="availability.id">
                  <td>{{ availability.name }}</td>
                  <td>
                    <span class="mr-2">
                      {{ isOpenTicket(availability) && formatOpenTicketExpiration(availability) }}
                    </span>
                    <AvailabilityExpiredLabel v-if="isExpired(availability)" />
                  </td>
                </tr>
              </template>

              <template v-else>
                <div
                  data-testid="empty-expired-availabilities-placeholder"
                  class="w-full p-4 text-text-100 text-center"
                >
                  {{ $t("experience.options.availability.empty-availabilities") }}
                </div>
              </template>
            </template>
          </SimpleTable>

          <template #actions>
            <NovaButtonIcon
              name="edit"
              shape="square"
              theme="dark"
              data-testid="availability-table-reroute"
              @click.stop="$router.push(option.availabilityPath)"
            />
          </template>
        </NovaCollapse>
        <OptionsRecapPickup :option-id="option.id!" :pickup-path="option.pickupPath" :readonly="readonly" />
        <OptionsRecapDetails
          :option-id="option.id!"
          :experience-id="experienceId"
          :path="option.detailsPath"
          :readonly="readonly"
        />
      </div>

      <template #actions>
        <span>
          <NovaButtonIcon
            v-if="shouldShowEditButton"
            name="edit"
            shape="square"
            theme="dark"
            data-testid="option-action-edit"
            @click.stop="$router.push(option.optionPath)"
          />
          <NovaButtonIcon
            v-if="shouldShowDeleteButton"
            name="trash"
            shape="square"
            theme="dark"
            data-testid="option-action-delete"
            @click="option.showModal.value = true"
          />
        </span>
      </template>
    </NovaCollapse>

    <NovaModalConfirm
      :show-modal="option.showModal.value"
      :title="$t('experience.option.delete.modal.title')"
      :description="$t('experience.option.delete.modal.description')"
      :cta-confirm-text="$t('common.delete')"
      :cta-cancel-text="$t('common.cancel')"
      :confirm-callback="option.delete"
      :cancel-callback="() => (option.showModal.value = false)"
    />
  </div>
  <CreateOptionButton
    v-show="!readonly"
    :flow="flow"
    :experience-id="experienceId"
    @option:created="(newRoute) => router.push(newRoute)"
  />
</template>

<script setup lang="ts">
import { useExperienceRaw } from "@/stores/experience-raw";
import SimpleTable from "@/components/Document/SimpleTable/SimpleTable.vue";
import { useNotifications } from "@/stores/notifications";
import { findDayOfTheWeek } from "@/utils/find-day-of-the-week";
import { DateTicket, DatetimeTicket, ExperienceType, OpenTicket, Pricing } from "@/types/generated/OfferServiceApiOld";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import NovaCollapse from "@/ui-kit/NovaCollapse/NovaCollapse.vue";
import NovaModalConfirm from "@/ui-kit/NovaModalConfirm/NovaModalConfirm.vue";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { isDateTimeTicket, isOpenTicket } from "@/features/experience-calendar/utils/availability-types-guard";
import { AvailabilityType } from "../types/Availability";
import CreateOptionButton from "./CreateOptionButton.vue";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import OptionsRecapPickup from "./OptionsRecapPickup.vue";
import OptionsRecapDetails from "./OptionsRecapDetails.vue";
import { PricingDefinition } from "@/types/Options";
import AvailabilityExpiredLabel from "./AvailabilityExpiredLabel.vue";
import { isBefore, startOfDay, startOfToday } from "date-fns";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import NovaCheckbox, { NovaCheckBoxStatus } from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import TableSortButton from "@/features/core-shared/components/TableSortButton.vue";
import { SortDirection, SortKey } from "@/types/SortingTypes";

const { $t, $isoDuration } = useNuxtApp();
const experienceRaw = useExperienceRaw();
const offerService = useOfferServiceApi();
const notifications = useNotifications();

const activeSortKey = ref<SortKey>("dates");
const orderDirection = ref<SortDirection>("asc");

// We always show the edit button, so the user can navigate even if it's readonly
const shouldShowEditButton = computed(() => true);
const shouldShowDeleteButton = computed(() => !props.readonly && options.value.length > 1);

const toggleDirectionOrder = (key: SortKey) => {
  if (key !== activeSortKey.value) {
    activeSortKey.value = key;
    orderDirection.value = "asc";
  } else {
    orderDirection.value = orderDirection.value === "desc" ? "asc" : "desc";
  }
};

const props = defineProps<{ readonly?: boolean }>();

const { params, name: routeName } = useRoute();
const router = useRouter();
const experienceId = params.id as string;

const flow = (routeName as string).split("-")[2];

const document = computed(() => experienceRaw.rawContents[experienceId]);

const hideExpiredAvailabilities = ref<NovaCheckBoxStatus>("unchecked");

const refreshDocument = async () => await experienceRaw.getRawDocument(experienceId);
const experienceType = computed(() => document.value.fields.experience_type!.value);
const isCalendarEnabled = computed(
  () =>
    document.value.data.offerExperience?.type !== ExperienceType.NO_CALENDAR_FIXED_END &&
    document.value.data.offerExperience?.type !== ExperienceType.NO_CALENDAR_FIXED_VALIDITY
);

if (document.value == null) {
  throw new Error(`Could not load raw document with id: ${experienceId}, make sure it's loaded in the store.`);
}
const options = computed(() =>
  document.value.fields.options!.value.map((option, index) => {
    const opt = {
      ...option,
      optionPath: `/experience/${experienceId}/options/${flow}/${option.id}/option-settings`,
      pricingPath: `/experience/${experienceId}/options/${flow}/${option.id}/pricing`,
      availabilityPath: `/experience/${experienceId}/options/${flow}/${option.id}/availability`,
      pickupPath: `/experience/${experienceId}/options/${flow}/${option.id}/pickups`,
      detailsPath: `/experience/${experienceId}/options/${flow}/${option.id}/customer-details`,
      open: ref(index === 0),
      pricings: ref<Record<string, Pricing[]>>({}),
      availabilities: ref<AvailabilityType[]>([]),
      showModal: ref(false),
      delete: async () => {
        try {
          await offerService.deleteOption(option.id as string);
          await refreshDocument();
        } catch (error) {
          notifications.addNotification({
            theme: "error",
            message: "experience.option.delete.error",
          });
        }
      },
      humanizedDuration: option.duration
        ? $isoDuration(option.duration).humanize("en")
        : $t("experience.option.duration.not-set"),
      humanizedCapacity:
        option.capacity_type === "unlimited"
          ? $t("experience.option.capacity.unlimited.description")
          : $t("experience.option.capacity.limited.description"),
    };

    offerService.getOptionPricing(option.id as string).then((res) => (opt.pricings.value = parsePricing(res.data)));

    offerService
      .getAvailabilities(option.id as string, experienceType.value)
      .then((res) => (opt.availabilities.value = res.data));

    return opt;
  })
);

function parsePricing(pricings: Pricing[]) {
  return pricings.reduce((prev, curr) => {
    prev[curr.name] = [...(prev[curr.name] || []), curr].sort((a, b) => a.holder.localeCompare(b.holder));

    return prev;
  }, {} as Record<string, Pricing[]>);
}

function parseDate(dateObj: DatetimeTicket["date_range"]) {
  const from = new Date(dateObj.from as string);
  const to = new Date(dateObj.to as string);
  return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
}

function parseDaysOfTheWeek(days: DatetimeTicket["days"] | DateTicket["days"]) {
  const formattedDays = computed(() => {
    const newDays = Object.keys(days).map((el) => $t(`common.${findDayOfTheWeek(parseInt(el))}.short`).toLowerCase());
    return newDays.join(", ");
  });
  return formattedDays.value.replaceAll('"', "");
}

const currentDate = startOfToday();

function isDatetimeTicketExpired(ticket: DatetimeTicket): boolean {
  if (!ticket.date_range.to) {
    return false;
  }
  const toDate = startOfDay(new Date(ticket.date_range.to));
  return isBefore(toDate, currentDate);
}

function getOpenTicketExpirationDate(ticket: OpenTicket): Date | null {
  if (!ticket.expiration_date) {
    return null;
  }
  return startOfDay(new Date(ticket.expiration_date));
}

function isOpenTicketExpired(ticket: OpenTicket): boolean {
  const expirationDate = getOpenTicketExpirationDate(ticket);
  return expirationDate ? isBefore(expirationDate, currentDate) : false;
}

function formatOpenTicketExpiration(ticket: OpenTicket): string {
  if (ticket.expiration_date) {
    return new Date(ticket.expiration_date).toLocaleDateString();
  } else if (ticket.expiration_days) {
    return `${ticket.expiration_days} ${$t("common.days")}`;
  }
  return $t("common.no_expiration");
}

function isExpired(availability: AvailabilityType): boolean {
  if (isDateTimeTicket(availability)) {
    return isDatetimeTicketExpired(availability);
  } else if (isOpenTicket(availability)) {
    return isOpenTicketExpired(availability);
  }
  return false;
}

const hasOptionWithAllAvailabilitiesExpired = computed(() => {
  return options.value.some(
    (option) => option.availabilities.value.length > 0 && option.availabilities.value.every(isExpired)
  );
});

const hasOptionWithAtLeastOneExpiredAvailability = computed(() => {
  return options.value.some((option) => option.availabilities.value.some(isExpired));
});

const toggleExpiredAvailabilities = () => {
  hideExpiredAvailabilities.value = hideExpiredAvailabilities.value === "checked" ? "unchecked" : "checked";
};

function sortByName(a: AvailabilityType, b: AvailabilityType): number {
  const nameA = a.name || "";
  const nameB = b.name || "";
  return nameA.localeCompare(nameB);
}

function sortByDateRange(a: AvailabilityType, b: AvailabilityType): number {
  let dateA: Date | null = null;
  let dateB: Date | null = null;

  if (isDateTimeTicket(a)) {
    dateA = a.date_range.from ? new Date(a.date_range.from) : null;
  } else if (isOpenTicket(a) && a.expiration_date) {
    dateA = new Date(a.expiration_date);
  }

  if (isDateTimeTicket(b)) {
    dateB = b.date_range.from ? new Date(b.date_range.from) : null;
  }

  if (dateA && dateB) {
    return dateA.getTime() - dateB.getTime();
  } else if (dateA) {
    return -1;
  } else if (dateB) {
    return 1;
  } else {
    return 0;
  }
}

const filteredOptions = computed(() => {
  return options.value.map((option) => {
    let availabilities =
      hideExpiredAvailabilities.value === "checked"
        ? option.availabilities.value.filter((availability) => !isExpired(availability))
        : option.availabilities.value;

    availabilities = [...availabilities].sort((a, b) => {
      if (activeSortKey.value === "name") {
        return sortByName(a, b);
      } else if (activeSortKey.value === "dates") {
        return sortByDateRange(a, b);
      } else {
        return 0;
      }
    });

    if (orderDirection.value === "desc") {
      availabilities.reverse();
    }

    return {
      ...option,
      availabilities,
    };
  });
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.SingleOption {
  .Info__key {
    @include font-regular(14);
  }

  .Info__value {
    @include font-regular(14);
  }
}

.PricingTable,
.AvailabilityTable {
  tr {
    display: grid;
    grid-template-columns: repeat(3, minmax(150px, 1fr));
  }

  &__list {
    li {
      padding: rem(3);
    }
  }

  &__detail {
    color: var(--color-text-80);

    @include font-regular(12);
  }
}

.form {
  height: fit-content;
  max-width: rem(1056);
  padding: rem(20) 0;
  display: grid;
  row-gap: rem(40);
  margin: 0 var(--content-margin-sm);
}

@include start-from(desktop-md) {
  .form {
    margin: 0 var(--content-margin-md);
  }
}
@include start-from(desktop-lg) {
  .form {
    margin: 0 var(--content-margin-lg);
  }
}
</style>
