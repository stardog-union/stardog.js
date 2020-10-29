/* eslint-disable global-require */
const Stardog = {
  version: require('../package.json').version,
  Connection: require('./Connection'),
  db: require('./db'),
  query: require('./query'),
  user: require('./user'),
  server: require('./server'),
  cluster: require('./cluster'),
  virtualGraphs: require('./virtualGraphs'),
  storedFunctions: require('./storedFunctions'),
  dataSources: require('./dataSources'),
};

module.exports = Stardog;
