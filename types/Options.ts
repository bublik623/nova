/**
 * Supported capacity type value
 */
export enum CapacityType {
  UNLIMITED = "unlimited",
  SHARED = "shared",
  PAX = "pax", // available by ticket holder type
  LANGUAGE = "language",
}

/**
 * Supported pricing definition type value
 */
export enum PricingDefinition {
  PERSON = "person",
  GROUP = "group",
}
