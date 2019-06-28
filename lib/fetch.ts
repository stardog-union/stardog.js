import fetchPonyfill from 'fetch-ponyfill';

const { fetch, Headers, Request } = fetchPonyfill();
export { fetch, Headers, Request };
