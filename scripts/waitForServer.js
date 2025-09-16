/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */

const { promisify } = require('node:util');
const { ConnectionFactory } = require('../test/setup-database');
const { catalog, server } = require('../lib');

const sleep = promisify(setTimeout);
const conn = ConnectionFactory();

async function waitForServer() {
  for (let retries = 0; retries < 30; retries += 1) {
    if (retries !== 0) {
      await sleep(2000);
    }

    // wait for server to be ready
    const serverResp = await server.status(conn).catch(e => e);
    if (!serverResp.ok || serverResp.status !== 200) {
      console.warn('Server is not ready:');
      console.warn(serverResp);
      continue;
    }

    // wait for catalog to be ready or else catalog tests can fail
    const catalogResp = await catalog.status(conn).catch(e => e);
    if (
      !catalogResp.ok ||
      catalogResp.status !== 200 ||
      !catalogResp.body?.providers?.length ||
      !catalogResp.body?.jobs?.length
    ) {
      console.warn('Catalog is not ready:');
      console.warn(catalogResp);
      continue;
    }

    console.log('Server and catalog are ready');
    return;
  }

  throw new Error('Server did not become ready in time');
}

waitForServer().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
