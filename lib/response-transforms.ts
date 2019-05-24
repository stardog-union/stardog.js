import lodashPick from 'lodash.pick';

const FIELDS = ['status', 'statusText', 'headers', 'ok', 'url'];

export const httpBody = async (res) => {
  const contentType = res.headers.get('content-type');
  const response = lodashPick(res, FIELDS);

  if (contentType && contentType.indexOf('json') > -1) {
    response.body = await res.json();
    return response;
  }

  const body = await res.text();
  response.body = body.trim();

  if (contentType === 'text/boolean') {
    response.body = body.toLowerCase() === 'true';
  }

  if (res.status === 204 || body === '') {
    response.body = null;
  }

  return response;
};

export const httpMessage = (res) => lodashPick(res, FIELDS);
