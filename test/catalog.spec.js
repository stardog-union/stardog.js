/* eslint-env jest */

const { catalog, query } = require('../lib');
const {
  ConnectionFactory,
  generateProviderIri,
  createAddProviderQuery,
  createValidateProviderQuery,
  createClearProviderQuery,
} = require('./setup-database');

// The stardog provider should always exist
const STARDOG_PROVIDER_IRI = 'tag:stardog:api:catalog:stardog';
const TEST_USERNAME = 'username';
const TEST_PASSWORD = 'password';
const TEST_LABEL = 'Test Credential Label';

describe('catalog', () => {
  const conn = ConnectionFactory();

  it('should list providers, including the stardog provider', () =>
    catalog.status(conn).then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.providers instanceof Array).toBe(true);
      const stardogProvider = res.body.providers.find(
        (provider) => provider.name === STARDOG_PROVIDER_IRI
      );
      expect(stardogProvider).not.toBe(undefined);
      expect(res.body.jobs instanceof Array).toBe(true);
    }));

  it('should trigger a reload without errors', () =>
    catalog.reload(conn, STARDOG_PROVIDER_IRI).then((res) => {
      expect(res.status).toBe(204);
    }));

  it('adds, lists, and removes credentials', () =>
    catalog
      .addCredential(
        conn,
        {
          username: TEST_USERNAME,
          password: TEST_PASSWORD,
        },
        TEST_LABEL
      )
      .then((res) => {
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
          (credential) => credential.key === accessKey
        );
        expect(listedCredential).toBeTruthy();
        expect(listedCredential.label).toBe(TEST_LABEL);
        return catalog.removeCredential(conn, accessKey);
      })
      .then((res) => {
        expect(res.status).toBe(204);
      }));

  it.skip('running an import job adds it to the list of jobs', () => {
    const providerIri = generateProviderIri();
    const importJob = `${providerIri} import`;

    const validateQuery = createValidateProviderQuery(providerIri);

    return query
      .execute(conn, 'catalog', createAddProviderQuery(providerIri))
      .then((addResponse) => {
        expect(addResponse.status).toBe(200);
        return query.execute(conn, 'catalog', validateQuery);
      })
      .then((validationResponse) => {
        expect(validationResponse.body.results.bindings).toHaveLength(5);
        return catalog.reload(conn, providerIri);
      })
      .then((reloadResponse) => {
        expect(reloadResponse.status).toBe(204);
        return catalog.status(conn);
      })
      .then((statusBeforeResponse) => {
        expect(statusBeforeResponse.status).toBe(200);
        const providerThatShouldExist =
          statusBeforeResponse.body.providers.find(
            (provider) => provider.name === providerIri
          );
        expect(providerThatShouldExist).not.toBeUndefined();
        const jobThatShouldntExist = statusBeforeResponse.body.jobs.find(
          (job) => job.name === importJob
        );
        expect(jobThatShouldntExist).toBeUndefined();
        return catalog.runJob(conn, importJob);
      })
      .then((runJobResponse) => {
        expect(runJobResponse.status).toBe(204);
        // The catalog takes a moment for the job to show up
        return new Promise((resolve) =>
          setTimeout(() => resolve(catalog.status(conn)), 5000)
        );
      })
      .then((statusAfterResponse) => {
        expect(statusAfterResponse.status).toBe(200);
        const providerThatShouldExist = statusAfterResponse.body.providers.find(
          (provider) => provider.name === providerIri
        );
        expect(providerThatShouldExist).not.toBeUndefined();
        const jobThatShouldExist = statusAfterResponse.body.jobs.find(
          (job) => job.name === importJob
        );
        expect(jobThatShouldExist).not.toBeUndefined();
      })
      .finally(() =>
        query.execute(conn, 'catalog', createClearProviderQuery(providerIri))
      )
      .then((clearResponse) => {
        expect(clearResponse.status).toBe(200);
        return query.execute(conn, 'catalog', validateQuery);
      })
      .then((validationResponse) => {
        expect(validationResponse.body.results.bindings).toHaveLength(0);
      });
  });
});
