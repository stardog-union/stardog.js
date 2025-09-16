const encodeQueryStringParams = params =>
  Object.entries(params)
    .flatMap(([key, value]) =>
      // stardog likes to see the same query param name multiple times, like:
      // { "default-graph-uri": ["urn:graph:schema", "urn:inference:rules"] } =>
      // '?default-graph-uri=urn:graph:schema&default-graph-uri=urn:inference:rules'
      (Array.isArray(value) ? value : [value]).map(
        v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`
      )
    )
    .join('&');

/** uri-encode params with a `?` prefix */
const encodeQueryString = params => {
  const queryString = encodeQueryStringParams(params);
  return queryString.length ? `?${queryString}` : '';
};

module.exports = {
  encodeQueryString,
  encodeQueryStringParams,
};
