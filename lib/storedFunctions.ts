import * as qs from 'querystring';
import { fetch } from './fetch';
import { httpBody } from './response-transforms';

export const add = async (conn, functions) => {
  const headers = conn.headers();

  const fetchResponse = await fetch(
    conn.request('admin', 'functions', 'stored'),
    {
      method: 'POST',
      body: functions,
      headers,
    }
  );

  return httpBody(fetchResponse);
};

export const get = async (conn, name) => {
  const headers = conn.headers();

  const fetchResponse = await fetch(
    conn.request('admin', 'functions', `stored?${qs.stringify({ name })}`),
    {
      headers,
    }
  );

  return httpBody(fetchResponse);
};

export const remove = (conn, name) => {
  const headers = conn.headers();

  return fetch(
    conn.request('admin', 'functions', `stored?${qs.stringify({ name })}`),
    {
      method: 'DELETE',
      headers,
    }
  );
};

export const clear = (conn) => {
  const headers = conn.headers();

  return fetch(conn.request('admin', 'functions', 'stored'), {
    method: 'DELETE',
    headers,
  });
};

export const getAll = async (conn) => {
  const headers = conn.headers();

  const fetchResponse = await fetch(
    conn.request('admin', 'functions', 'stored'),
    {
      headers,
    }
  );

  return httpBody(fetchResponse);
};
