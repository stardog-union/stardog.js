/* eslint-env jest */

const { catalog } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

// The stardog provider should always exist
const STARDOG_PROVIDER_IRI = 'tag:stardog:api:catalog:stardog';
const TEST_USERNAME = 'username';
const TEST_PASSWORD = 'password';
const TEST_LABEL = 'Test Credential Label';

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

  it('adds, lists, and removes credentials', () => {
    catalog
      .addCredential(
        conn,
        {
          username: TEST_USERNAME,
          password: TEST_PASSWORD,
        },
        TEST_LABEL
      )
      .then(res => {
        expect(res.status).toBe(201);
        expect(res.body.accessKey).toBeTruthy();
        return Promise.all([
          Promise.resolve(res.body.accessKey),
          catalog.listCredentials(conn),
        ]);
      })
      .then(([accessKey, res]) => {
        expect(res.status).toBe(200);
        const listedCredential = res.body.find(
          credential => credential.key === accessKey
        );
        expect(listedCredential).toBeTruthy();
        expect(listedCredential.label).toBe(TEST_LABEL);
        return catalog.removeCredential(conn, accessKey);
      })
      .then(res => {
        expect(res.status).toBe(204);
      });
  });

  it.todo('runs jobs');
});
