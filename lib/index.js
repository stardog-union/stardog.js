/* eslint-disable global-require */
const Stardog = {
  version: require('../package.json').version,
  Connection: require('./Connection'),
  db: require('./db'),
  query: require('./query'),
  server: require('./server'),
  user: require('./user'),
  role: require('./role'),
  transaction: require('./transaction'),
};

module.exports = Stardog;
