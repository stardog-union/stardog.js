/* eslint-disable global-require */
module.exports = require('fetch-ponyfill')();

// Default test for using the fetch agent.
// const isNodeLike = () =>
//   Boolean(
//     global && process && /\[native code\]/.test(process.constructor.toString())
//   );
