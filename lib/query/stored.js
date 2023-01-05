const { fetch } = require('../fetch');
const { httpBody } = require('../response-transforms');

const convertToJsonLd = (conn, storedQuery) => {
  const types = ['system:StoredQuery'];
  if (storedQuery.shared) {
    types.push('system:SharedQuery');
  }
  if (storedQuery.reasoning) {
    types.push('system:ReasoningQuery');
  }

  const keyValuePairs = Object.entries(
    Object.assign(
      {
        'system:queryName': storedQuery.name,
        'system:queryDescription': storedQuery.description,
        'system:queryString': storedQuery.query,
        'system:queryCreator': conn.username,
        'system:queryDatabase': storedQuery.database,
      },
      storedQuery.annotations
    )
  ).reduce((obj, [iri, value]) => {
    if (typeof value !== 'undefined') {
      obj[iri] = { '@value': value };
    }
    return obj;
  }, {});

  return {
    '@context': {
      system: 'http://system.stardog.com/',
    },
    '@graph': [
      Object.assign(
        {
          '@id': 'system:Query',
          '@type': types,
        },
        keyValuePairs
      ),
    ],
  };
};

/*
  body
    - name string
    - database string or "*"
    - query
    - shared boolean (defaults to false)
*/
const create = (conn, storedQuery) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/ld+json');
  headers.set('Accept', 'application/json');

  return fetch(conn.request('admin', 'queries', 'stored'), {
    headers,
    method: 'POST',
    body: JSON.stringify(convertToJsonLd(conn, storedQuery)),
  }).then(httpBody);
};

const list = (conn, options = {}) => {
  const headers = conn.headers();
  headers.set('Accept', options.accept || 'application/json');

  return fetch(conn.request('admin', 'queries', 'stored'), {
    headers,
  }).then(httpBody);
};

const deleteStoredQuery = (conn, storedQuery) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');

  return fetch(conn.request('admin', 'queries', 'stored', storedQuery), {
    headers,
    method: 'DELETE',
  }).then(httpBody);
};

const renameStoredQuery = (conn, name, newName) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Accept', 'application/json');

  const body = { name: newName };
  return fetch(conn.request('admin', 'queries', 'stored', name), {
    headers,
    method: 'POST',
    body: JSON.stringify(body),
  }).then(httpBody);
};

const replace = (conn, storedQuery) =>
  deleteStoredQuery(conn, storedQuery.name).then(deleteResponse => {
    //  Update creates when the query did not already exist
    if (deleteResponse.status === 404 || deleteResponse.ok) {
      return create(conn, storedQuery);
    }
    return deleteResponse;
  });

const updateStoredQuery = (conn, storedQuery, useUpdateMethod = true) => {
  if (!useUpdateMethod) {
    return replace(conn, storedQuery);
  }
  const headers = conn.headers();
  headers.set('Content-Type', 'application/ld+json');
  headers.set('Accept', 'application/json');

  return fetch(conn.request('admin', 'queries', 'stored'), {
    headers,
    method: 'PUT',
    body: JSON.stringify(convertToJsonLd(conn, storedQuery)),
  })
    .then(httpBody)
    .then(updateResponse => {
      if (updateResponse.status === 405) {
        return replace(conn, storedQuery);
      }
      return updateResponse;
    });
};

module.exports = {
  create,
  list,
  remove: deleteStoredQuery,
  rename: renameStoredQuery,
  update: updateStoredQuery,
};
