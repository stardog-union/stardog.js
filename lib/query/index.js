const query = require('./main');
const stored = require('./stored');
const graphql = require('./graphql');
const utils = require('./utils');

module.exports = { ...query, stored, graphql, utils };
