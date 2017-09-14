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

  if (
    q.startsWith('insert') ||
    q.startsWith('delete') ||
    q.startsWith('with') ||
    q.startsWith('load') ||
    q.startsWith('clear') ||
    q.startsWith('create') ||
    q.startsWith('drop') ||
    q.startsWith('copy') ||
    q.startsWith('move') ||
    q.startsWith('add')
  ) {
    return 'update';
  }

  if (q.startsWith('paths')) {
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
    return 'application/ld+json';
  }

  return null;
};

module.exports = {
  queryType,
  mimeType,
};
