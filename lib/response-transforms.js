const lodashPick = require('lodash/pick');

const FIELDS = ['status', 'statusText', 'headers', 'ok', 'url'];

module.exports = {
  httpMessage: res => {
    const response = lodashPick(res, FIELDS);
    response.body = null;
    return response;
  },
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
        response.body = text;
        if (contentType === 'text/boolean') {
          response.body = text.toLowerCase() === 'true';
        }
        return response;
      });
    }
  },
};
