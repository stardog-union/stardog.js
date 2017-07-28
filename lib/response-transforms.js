const lodashPick = require('lodash/pick');

const FIELDS = ['status', 'statusText', 'headers', 'ok', 'url'];

module.exports = {
  httpBody: res => {
    {
      const contentType = res.headers.get('content-type');
      const response = lodashPick(res, FIELDS);
      if (contentType && contentType.indexOf('json') > -1) {
        return res.json().then(json => {
          response.body = json;
          return response;
        });
      }
      return res.text().then(text => {
        const body = text.trim();
        response.body = body;
        if (contentType === 'text/boolean') {
          response.body = body.toLowerCase() === 'true';
        }

        if (res.status === 204) {
          response.body = null;
        }

        if (body === '') {
          response.body = null;
        }

        return response;
      });
    }
  },
};
