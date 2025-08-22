/* eslint-env jest */

const fs = require('fs');
const path = require('path');
const dataSources = require('../lib/dataSources');
const { ConnectionFactory } = require('./setup-database');

const dataSourceMetadata = fs.readFileSync(
  path.resolve(`${__dirname}/fixtures/data_source_metadata.ttl`),
  'utf8'
);

const dataSourceTables = fs.readFileSync(
  path.resolve(`${__dirname}/fixtures/data_source_tables.json`),
  'utf8'
);

const dataSourceTableMetadata = fs.readFileSync(
  path.resolve(`${__dirname}/fixtures/data_source_table_metadata.ttl`),
  'utf8'
);

describe('data_sources', () => {
  let conn;
  const aDSName = 'MyDataSource';
  const aOptions = {
    'jdbc.driver': 'com.mysql.jdbc.Driver',
    'jdbc.url': 'jdbc:mysql://localhost:3306/sys',
    'jdbc.username': 'root',
    'jdbc.password': '',
    'ext.serverTimezone': 'EST',
  };

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  const assureExists = () =>
    dataSources.list(conn).then(res => {
      const exists =
        res.body.data_sources && res.body.data_sources.includes(aDSName);
      if (!exists) {
        return dataSources.add(conn, aDSName, aOptions);
      }
      return res;
    });

  const assureNotExists = () =>
    dataSources.list(conn).then(res => {
      const exists =
        res.body.data_sources && res.body.data_sources.includes(aDSName);
      if (exists) {
        return dataSources.remove(conn, aDSName);
      }
      return res;
    });

  describe('list', () => {
    it('retrieves a list of data sources', () =>
      dataSources.list(conn).then(res => {
        expect(res.status).toBe(200);
        expect(res.body.data_sources).toBeInstanceOf(Array);
      }));
  });

  // TODO remove .only; test with a real datasource
  describe.only('listInfo', () => {
    it('retrieves a list of data source info', () =>
      dataSources.listInfo(conn).then(res => {
        expect(res.status).toBe(200);
        expect(res.body.data_sources).toBeInstanceOf(Array);
      }));
  });

  describe('info', () => {
    it('retrieves an exsiting data source info', () =>
      assureExists()
        .then(() => dataSources.info(conn, aDSName))
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.info).toBeInstanceOf(Object);
        }));
  });

  describe('add', () => {
    it('adds a data source', () =>
      assureNotExists()
        .then(() => dataSources.add(conn, aDSName, aOptions))
        .then(res => {
          expect(res.status).toBe(201);
        }));
  });

  describe('update', () => {
    it('updates an existing data source', () =>
      assureExists()
        .then(() => dataSources.update(conn, aDSName, aOptions))
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Object);
        }));
  });

  describe('remove', () => {
    it('removes an existing data source', () =>
      assureExists()
        .then(() => dataSources.remove(conn, aDSName))
        .then(res => {
          expect(res.status).toBe(204);
        }));
  });

  // Skip dataSources.online because not sure how to create an "offline" data source
  // describe.only('online', () => {
  //   it('brings a private data source online', () =>
  //     assurePrivateExists()
  //       .then(() => dataSources.online(conn, aDSName))
  //       .then(res => {
  //         console.log(res)
  //         expect(res.status).toBe(200);
  //         expect(res.body.available).toBe(true);
  //       }));
  // });

  describe('available', () => {
    it('returns true when a data source is available', () =>
      assureExists()
        .then(() => dataSources.available(conn, aDSName))
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.available).toBe(true);
        }));
  });

  describe('options', () => {
    it('returns the options of a data source', () =>
      assureExists()
        .then(() => dataSources.options(conn, aDSName))
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.options).toEqual(aOptions);
        }));
  });

  describe('getMetadata', () => {
    it('returns the metadata of a data source', () =>
      assureExists()
        .then(() => dataSources.getMetadata(conn, aDSName))
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toEqual(dataSourceMetadata);
        }));
  });

  describe('getTables', () => {
    it('returns the tables for a data source', () =>
      assureExists()
        .then(() => dataSources.getTables(conn, aDSName))
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toEqual(dataSourceTables);
        }));
  });

  describe('getTableMetadata', () => {
    it('returns the metadata of a table', () =>
      assureExists()
        .then(() =>
          dataSources.getTableMetadata(conn, aDSName, {
            table_name: 'table-name',
            table_type: 'TABLE',
            catalog: 'catalog',
            schema: 'schema',
          })
        )
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toEqual(dataSourceTableMetadata);
        }));
  });

  describe('updateMetadata', () => {
    it('updates the metadata of a data source', () =>
      assureExists()
        .then(() =>
          dataSources.updateMetadata(conn, aDSName, dataSourceMetadata)
        )
        .then(res => {
          expect(res.status).toBe(204);
        }));
  });

  describe('suggestions', () => {
    const tableName = 'TODO';

    it('returns successfully when given a valid configuration', () =>
      assureExists().then(() =>
        dataSources
          .suggestions(
            conn,
            `
<tag:stardog:api:match:configuration> {
  [] <tag:stardog:api:match:source> <data-source://${aDSName}> ;
    <tag:stardog:api:match:sourceTable> "${tableName}" ;
    <tag:stardog:api:match:target> <tag:stardog:project:model> ;
}

<tag:stardog:project:model> {
 
}
`
          )
          .then(res => {
            expect(res.status).toBe(200);
          })
      ));
  });
});
