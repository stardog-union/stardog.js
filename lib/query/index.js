const query = require('./main');
const stored = require('./stored');
const graphql = require('./graphql');
const utils = require('./utils');

module.exports = Object.assign({}, query, { stored }, { graphql }, { utils });
