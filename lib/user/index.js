const user = require('./main');
const role = require('./role');

module.exports = Object.assign({}, user, { role });
