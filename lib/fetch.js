/* eslint-disable global-require */
const ponyfill = require('fetch-ponyfill')();

const { fetch: originalFetch } = ponyfill;

// Default test for using the fetch agent.
const isNodeLike = () =>
  Boolean(
    global && process && /\[native code\]/.test(process.constructor.toString())
  );

const wrapFetch = fetchMetadata => {
  ponyfill.fetch = (url, options) => {
    const shouldUseAgent = fetchMetadata.shouldUseAgent
      ? fetchMetadata.shouldUseAgent(url, options)
      : isNodeLike();

    if (!shouldUseAgent) {
      return originalFetch(url, options);
    }

    // If the user passes `agent` options for a request, just use those;
    // otherwise, use the agent on fetchMetadata
    const adjustedOptions = options.agent
      ? options
      : Object.assign({}, options, {
          agent: fetchMetadata.agent,
        });

    return originalFetch(url, adjustedOptions);
  };
};

const unwrapFetch = () => {
  ponyfill.fetch = originalFetch;
};

module.exports = Object.assign({}, ponyfill, {
  // Add an extra level of indirection so that the wrapping methods above can
  // be called (and their effects can be seen) after this module has already
  // been imported by other modules.
  fetch(url, options) {
    return ponyfill.fetch(url, options);
  },
});
module.exports.wrapFetch = wrapFetch;
module.exports.unwrapFetch = unwrapFetch;
