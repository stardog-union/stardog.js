module.exports = {
  httpMessage: res => ({
    status: res.status,
    statusText: res.statusText,
  }),
  httpBody: res => {
    {
      const contentType = res.headers.get('content-type');
      // TODO:
      // I'll need to look at this again because the response isn't always application/json
      if (contentType && contentType.indexOf('json') > -1) {
        return res.json().then(result => ({
          result,
          status: res.status,
          statusText: res.statusText,
        }));
      } else {
        return res.text().then(result => ({
          result,
          status: res.status,
          statusText: res.statusText,
        }));
      }
    }
  },
};
