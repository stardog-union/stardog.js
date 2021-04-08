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

// See VET-634 internally. The idea here is to use the globally available
// (native) `fetch` when it is available. This allows for better response
// streaming and access to response headers when a response starts rather than
// when it ends.
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
