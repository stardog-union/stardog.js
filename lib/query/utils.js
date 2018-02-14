// Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
// For Tableau, which doesn't support String.prototype.startsWith for some reason
const startsWith = (str, search, pos) =>
  str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;

const queryType = query => {
  // Lifted from http://tinyurl.com/ybnd9wzl
  // i'm almost certain I'm going to have to revisit this.
  const q = query
    // remove prefix information
    .replace(/prefix[^:]+:\s*<[^>]*>\s*/gi, '')
    // remove base information
    .replace(/^((base\s+<[^>]*>\s*)|([\t ]*#([^\n\r]*)))([\r|\r\n|\n])/gim, '')
    // flatten everything down into a single string
    .replace(/\s/g, '')
    .toLowerCase();

  if (startsWith(q, 'select')) {
    return 'select';
  }

  if (startsWith(q, 'ask')) {
    return 'ask';
  }

  if (startsWith(q, 'construct')) {
    return 'construct';
  }

  if (startsWith(q, 'describe')) {
    return 'describe';
  }

  if (
    startsWith(q, 'insert') ||
    startsWith(q, 'delete') ||
    startsWith(q, 'with') ||
    startsWith(q, 'load') ||
    startsWith(q, 'clear') ||
    startsWith(q, 'create') ||
    startsWith(q, 'drop') ||
    startsWith(q, 'copy') ||
    startsWith(q, 'move') ||
    startsWith(q, 'add')
  ) {
    return 'update';
  }

  if (startsWith(q, 'paths')) {
    return 'paths';
  }

  return null;
};

const mimeType = query => {
  const type = queryType(query);

  if (type === 'select' || type === 'paths') {
    return 'application/sparql-results+json';
  }

  if (type === 'ask' || type === 'update') {
    return 'text/boolean';
  }

  if (type === 'construct' || type === 'describe') {
    return 'text/turtle';
  }

  return '*/*';
};

module.exports = {
  queryType,
  mimeType,
};
