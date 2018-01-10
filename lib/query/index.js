const query = require('./main');
const stored = require('./stored');
const graphql = require('./graphql');

module.exports = Object.assign({}, query, { stored }, { graphql });
