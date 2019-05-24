import FormData from 'form-data';
import { fetch } from '../fetch';
import { httpBody } from '../response-transforms';

export const size = async (conn, database) => {
  const headers = conn.headers();
  headers.set('Accept', 'text/plain');

  const fetchResponse = await fetch(conn.request(database, 'docs', 'size'), {
    headers,
  });

  return httpBody(fetchResponse);
};

export const clear = async (conn, database) => {
  const headers = conn.headers();
  const fetchResponse = await fetch(conn.request(database, 'docs'), {
    method: 'DELETE',
    headers,
  });

  return httpBody(fetchResponse);
};

export const add = async (conn, database, fileName, fileContents) => {
  const headers = conn.headers();
  const formData = new FormData();
  formData.append('upload', new Buffer(fileContents), {
    filename: fileName,
  });
  // Copy over formData headers, since node-fetch 2+ apparently doesn't do this
  // automatically. See: https://github.com/bitinn/node-fetch/issues/368
  const formDataHeaders = formData.getHeaders();
  Object.keys(formDataHeaders).forEach((key) => {
    headers.set(key, formDataHeaders[key]);
  });
  const fetchResponse = await fetch(conn.request(database, 'docs'), {
    method: 'POST',
    body: formData,
    headers,
  });

  return httpBody(fetchResponse);
};

export const remove = async (conn, database, fileName) => {
  const headers = conn.headers();
  const fetchResponse = await fetch(conn.request(database, 'docs', fileName), {
    method: 'DELETE',
    headers,
  });

  return httpBody(fetchResponse);
};

export const get = async (conn, database, fileName) => {
  const headers = conn.headers();
  const fetchResponse = await fetch(conn.request(database, 'docs', fileName), {
    headers,
  });

  return httpBody(fetchResponse);
};
