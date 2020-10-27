const db = require('./main');
const icv = require('./icv');
const transaction = require('./transaction');
const options = require('./options');
const graph = require('./graph');
const reasoning = require('./reasoning');
const docs = require('./docs');
const namespaces = require('./namespaces');

module.exports = Object.assign(
  {},
  db,
  { icv },
  { transaction },
  { options },
  { docs },
  { graph },
  { reasoning },
  { namespaces }
);
