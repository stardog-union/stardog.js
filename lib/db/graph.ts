import { fetch } from '../fetch';
import qs from 'querystring';
import { httpBody } from '../response-transforms';

export const doGet = async (
  conn,
  database,
  graphUri = null,
  accept = 'application/ld+json'
) => {
  const headers = conn.headers();
  headers.set('Accept', accept);
  const resource = `${database}?${
    graphUri ? qs.stringify({ graph: graphUri }) : 'default'
  }`;

  const fetchResponse = await fetch(conn.request(resource), {
    headers,
  });

  return httpBody(fetchResponse);
};

export const doDelete = async (conn, database, graphUri = null) => {
  const headers = conn.headers();
  const resource = `${database}?${
    graphUri ? qs.stringify({ graph: graphUri }) : 'default'
  }`;

  const fetchResponse = await fetch(conn.request(resource), {
    headers,
    method: 'DELETE',
  });

  return httpBody(fetchResponse);
};

export const doPut = async (
  conn,
  database,
  graphData,
  graphUri = null,
  contentType = 'application/ld+json'
) => {
  const headers = conn.headers();
  headers.set('Content-Type', contentType);
  const resource = `${database}?${
    graphUri ? qs.stringify({ graph: graphUri }) : 'default'
  }`;

  const fetchResponse = await fetch(conn.request(resource), {
    headers,
    method: 'PUT',
    body: graphData,
  });

  return httpBody(fetchResponse);
};

export const doPost = async (
  conn,
  database,
  graphData,
  graphUri = null,
  contentType = 'application/ld+json'
) => {
  const headers = conn.headers();
  headers.set('Content-Type', contentType);
  const resource = `${database}?${
    graphUri ? qs.stringify({ graph: graphUri }) : 'default'
  }`;

  const fetchResponse = await fetch(conn.request(resource), {
    headers,
    method: 'POST',
    body: graphData,
  });

  return httpBody(fetchResponse);
};
