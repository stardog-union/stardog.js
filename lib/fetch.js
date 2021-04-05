/* eslint-disable global-require, no-nested-ternary, no-undef */
function getGlobal() {
  return typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined' ? global : null;
}

function hasAll(keys, obj) {
  return keys.every(key => key in obj);
}

const foundGlobal = getGlobal();
const fetchRelatedKeys = ['fetch', 'Headers', 'Request', 'Response'];

// TODO: Remove the static dependency on 'fetch-ponyfill', given that many
// in-browser cases will now have no need for it. The current solution here is
// only a temporary, transitional way of using native `fetch` in such cases.
module.exports =
  foundGlobal && hasAll(fetchRelatedKeys, foundGlobal)
    ? fetchRelatedKeys.reduce((fetchContainer, key) => {
        fetchContainer[key] = foundGlobal[key];
        return fetchContainer;
      }, {})
    : require('fetch-ponyfill')();
