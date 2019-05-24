import { fetch } from './fetch';
import { httpBody } from './response-transforms';

export const list = async (conn) => {
  const headers = conn.headers();
  const fetchResponse = await fetch(conn.request('admin', 'virtual_graphs'), {
    headers,
  });

  return httpBody(fetchResponse);
};

export const add = async (conn, name, mappings, options) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  const fetchResponse = await fetch(conn.request('admin', 'virtual_graphs'), {
    method: 'POST',
    body: JSON.stringify({
      name,
      mappings,
      options,
    }),
    headers,
  });

  return httpBody(fetchResponse);
};

export const update = async (conn, name, mappings, options) => {
  const headers = conn.headers();
  headers.set('Content-Type', 'application/json');
  const fetchResponse = await fetch(
    conn.request('admin', 'virtual_graphs', name),
    {
      method: 'PUT',
      body: JSON.stringify({
        name,
        mappings,
        options,
      }),
      headers,
    }
  );

  return httpBody(fetchResponse);
};

export const remove = async (conn, name) => {
  const headers = conn.headers();
  const fetchResponse = await fetch(
    conn.request('admin', 'virtual_graphs', name),
    {
      method: 'DELETE',
      headers,
    }
  );

  return httpBody(fetchResponse);
};

export const available = async (conn, name) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  const fetchResponse = await fetch(
    conn.request('admin', 'virtual_graphs', name, 'available'),
    {
      headers,
    }
  );

  return httpBody(fetchResponse);
};

export const options = async (conn, name) => {
  const headers = conn.headers();
  const fetchResponse = await fetch(
    conn.request('admin', 'virtual_graphs', name, 'options'),
    {
      headers,
    }
  );

  return httpBody(fetchResponse);
};

export const mappings = async (conn, name, requestOptions = {}) => {
  const headers = conn.headers();

  if (requestOptions.preferUntransformed) {
    // Try to get the mappings string that was last submitted, not the
    // transformed mappings. (If syntax doesn't match, however, you'll still
    // get generated mapptings.)
    const syntax = requestOptions.syntax || 'SMS2';
    const fetchResponse = await fetch(
      conn.request('admin', 'virtual_graphs', name, 'mappingsString', syntax),
      {
        headers,
      }
    );

    return httpBody(fetchResponse);
  }

  const fetchResponse = await fetch(
    conn.request('admin', 'virtual_graphs', name, 'mappings'),
    {
      headers,
    }
  );

  return httpBody(fetchResponse);
};
