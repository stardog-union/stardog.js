import fetchPonyfill from 'fetch-ponyfill';

const ponyfill = fetchPonyfill();

export const fetch = ponyfill.fetch;
export const Request = ponyfill.Request;
export const Response = ponyfill.Response;
export const Headers = ponyfill.Headers;
