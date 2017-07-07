const _ = require('lodash');

module.exports = {
  httpMessage: res => ({
    status: res.status,
    statusText: res.statusText,
  }),
  httpBody: res => {
    {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.indexOf('json') > -1) {
        return res.json().then(result => {
          return {
            result,
            status: res.status,
            statusText: res.statusText,
          };
        });
      } else {
        return res.text().then(result => {
          if (contentType === 'text/boolean') {
            result = result.toLowerCase() === 'true';
          }
          return {
            result,
            status: res.status,
            statusText: res.statusText,
          };
        });
      }
    }
  },
};
