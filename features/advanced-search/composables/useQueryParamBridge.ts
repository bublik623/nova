import { useRouteQuery } from "@vueuse/router";

/**
 * Establish a bridge between a query parameter to a Ref<T>; this allows, for example, to bind the
 * a query parameter to a value in the state of a store.
 *
 * The flow is the following:
 * - if there already is the given query parameter and if it have a valid value, it sets the bridge value to the query param value
 * - otherwise it sets the query parameter value to the bridge value
 * - after this initial setup, the query parameter value will be updated each time the bridge value change
 *
 * @param bridge the ref to the state that have to be represented as query param
 * @param queryParamName the name of the query param that will represent the state
 * @param transform the function to convert the query param value into the state value, defaults to identity function
 * @param validate function used to validate value coming from url, defaults to always true
 */
export function useQueryParamBridge<T extends string>(
  bridge: Ref<T>,
  queryParamName: string,
  transform: (val: T) => T = (val) => val as any as T,
  validate: (val: T) => boolean = (_) => true
) {
  const queryParam = useRouteQuery<T>(queryParamName, undefined, { transform });

  if (queryParam.value !== undefined && validate(queryParam.value)) {
    bridge.value = queryParam.value;
  } else {
    queryParam.value = bridge.value;
  }

  watch(
    () => bridge.value,
    (newStateValue) => {
      queryParam.value = newStateValue;
    }
  );
}
