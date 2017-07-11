module.exports = {
  httpMessage: res => ({
    status: res.status,
    statusText: res.statusText,
  }),
  httpBody: res => {
    {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.indexOf('json') > -1) {
        return res.json().then(result => ({
          result,
          status: res.status,
          statusText: res.statusText,
        }));
      }
      return res.text().then(result => {
        const response = {
          status: res.status,
          statusText: res.statusText,
          result,
        };
        if (contentType === 'text/boolean') {
          response.result = result.toLowerCase() === 'true';
        }
        return response;
      });
    }
  },
};
