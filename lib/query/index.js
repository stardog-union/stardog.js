const query = require('./main');
const stored = require('./stored');

module.exports = Object.assign({}, query, { stored });
