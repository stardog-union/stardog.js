/* eslint-env jest */

const { catalog } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

// The stardog provider should always exist
const STARDOG_PROVIDER_IRI = 'tag:stardog:api:catalog:stardog';

describe('catalog', () => {
  const conn = ConnectionFactory();

  it('should list providers, including the stardog provider', () =>
    catalog.status(conn).then(res => {
      expect(res.status).toBe(200);
      expect(res.body.providers instanceof Array).toBe(true);
      const stardogProvider = res.body.providers.find(
        provider => provider.name === STARDOG_PROVIDER_IRI
      );
      expect(stardogProvider).not.toBe(undefined);
      expect(res.body.jobs instanceof Array).toBe(true);
    }));

  it('should trigger a reload without errors', () =>
    catalog.reload(conn, STARDOG_PROVIDER_IRI).then(res => {
      expect(res.status).toBe(204);
    }));
});
