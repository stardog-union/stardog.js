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

  if (q.startsWith('select')) {
    return 'select';
  }

  if (q.startsWith('ask')) {
    return 'ask';
  }

  if (q.startsWith('construct')) {
    return 'construct';
  }

  if (q.startsWith('describe')) {
    return 'describe';
  }

  return null;
};

const mimeType = query => {
  const type = queryType(query);

  if (type === 'select') {
    return 'application/sparql-results+json';
  }

  if (type === 'ask') {
    return 'text/boolean';
  }

  if (type === 'construct' || type === 'describe') {
    return 'application/ld+json';
  }

  return null;
};

const buildQuery = (query, params = {}) => {
  const queryParams = ['baseURI', 'limit', 'offset', 'reasoning'];
  const body = Object.keys(params)
    // If it's a supported query param and it has a value, include it
    .filter(v => queryParams.indexOf(v) > -1 && params[v] != null)
    .reduce((memo, key) => Object.assign({}, memo, { [key]: params[key] }), {
      query,
    });

  return body;
};

module.exports = {
  queryType,
  buildQuery,
  mimeType,
};
