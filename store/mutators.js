import { get, PropertyPath, set as _set } from 'lodash';

/**
 * Sets a property on state by key.
 *
 * @param {string} propertyPath - Property path.
 * @param {string} valuePath - Value path.
 */
export const set = (propertyPath, valuePath) => (state, payload) => {
  const value = get(payload, valuePath);
  _set(state, propertyPath, value);
};

/**
 * Sets a property on state by key as long as it's not null.
 *
 * @param {string} propertyPath - Property path.
 * @param {string} valuePath - Value path.
 */
export const set_if_not_null =
  (propertyPath, valuePath) => (state, payload) => {
    if (undefined !== payload && null !== payload) {
      const value = get(payload, valuePath);
      _set(state, propertyPath, value);
    }
  };

/**
 * Reset state back to initial state.
 *
 * @param {object} state - Current state.
 * @param {object} initialState - Initial state.
 */
export const reset = (state, initialState) => {
  Object.keys(initialState).forEach((key) => {
    state[key] = initialState[key];
  });
};
