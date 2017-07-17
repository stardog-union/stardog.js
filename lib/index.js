/* eslint-disable global-require */
const Stardog = {
  version: require('../package.json').version,
  Connection: require('./Connection'),
  db: require('./db'),
  query: require('./query'),
  user: require('./user'),
  server: require('./server'),
};

module.exports = Stardog;
