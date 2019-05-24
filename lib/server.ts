import * as qs from 'querystring';
import { fetch } from './fetch';
import { httpBody, httpMessage } from './response-transforms';

export const shutdown = async (conn) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  const fetchResponse = await fetch(conn.request('admin', 'shutdown'), {
    headers,
  });

  return httpMessage(fetchResponse);
};

export const status = async (conn, params = {}) => {
  const headers = conn.headers();
  headers.set('Accept', 'application/json');
  const queryString = qs.stringify(params);
  const fetchResponse = await fetch(
    conn.request(
      'admin',
      `status${queryString.length > 0 ? `?${queryString}` : ''}`
    ),
    {
      headers,
    }
  );

  return httpBody(fetchResponse);
};
