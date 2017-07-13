const lodashPick = require('lodash/pick');

const FIELDS = ['status', 'statusText', 'headers', 'ok', 'url'];

module.exports = {
  httpMessage: res => {
    const response = lodashPick(res, FIELDS);
    return response;
  },
  httpBody: res => {
    {
      const contentType = res.headers.get('content-type');
      const response = lodashPick(res, FIELDS);
      if (contentType && contentType.indexOf('json') > -1) {
        return res.json().then(json => {
          response.result = json;
          return response;
        });
      }
      return res.text().then(text => {
        response.result = text;
        if (contentType === 'text/boolean') {
          response.result = text.toLowerCase() === 'true';
        }
        return response;
      });
    }
  },
};
