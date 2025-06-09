/**
 * This type is used to allow either a specific type or a string.
 * It is useful when we want to allow a predefined type (like an enum) or a custom string.
 *
 * @template T - The specific type that is allowed.
 *
 * @example
 * If T is a union of "red" and "blue", UnionOrString<T> can be "red", "blue" or any other string.
 *
 * type Color = "red" | "blue";
 * let color: UnionOrString<Color>;
 * color = "red"; // valid
 * color = "blue"; // valid
 * color = "#fff000"; // valid
 */
export type UnionOrString<T> = T | (string & {}); //NOSONAR
