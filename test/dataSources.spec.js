/* eslint-env jest */

const dataSources = require('../lib/dataSources');
const { ConnectionFactory } = require('./setup-database');
const snapshots = require('./__snapshots__/dataSources.spec.js.snap');

/*
Run the following to set up the MySQL database used in these tests:
echo "drop database if exists stardogjs_test; create database stardogjs_test; use stardogjs_test; create table test_table (id INT PRIMARY KEY);" | mysql -h host.docker.internal -uroot -pmy-secret
*/

const aDSName = 'stardogjs_test';
const aOptions = {
  'jdbc.driver': 'com.mysql.jdbc.Driver',
  'jdbc.url': 'jdbc:mysql://host.docker.internal:3306/stardogjs_test',
  'jdbc.username': 'root',
  'jdbc.password': 'my-secret',
};

describe('data_sources', () => {
  let conn;
  beforeEach(() => {
    conn = ConnectionFactory();
  });

  const assureExists = () =>
    dataSources.list(conn).then(listResponse => {
      expect(listResponse.status).toBe(200);

      const exists =
        listResponse.body.data_sources &&
        listResponse.body.data_sources.includes(aDSName);
      if (!exists) {
        return dataSources.add(conn, aDSName, aOptions).then(addResponse => {
          expect(addResponse.status).toBe(201);
        });
      }
      return listResponse;
    });

  const assureNotExists = () =>
    dataSources.list(conn).then(listResponse => {
      const exists =
        listResponse.body.data_sources &&
        listResponse.body.data_sources.includes(aDSName);
      if (exists) {
        return dataSources.remove(conn, aDSName).then(removeResponse => {
          expect(removeResponse.status).toBe(204);
        });
      }
      return listResponse;
    });

  describe('list', () => {
    it('retrieves a list of data sources', () =>
      dataSources.list(conn).then(res => {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data_sources)).toBe(true);
      }));
  });

  // TODO remove .only; test with a real datasource
  // eslint-disable-next-line no-restricted-properties, jest/no-focused-tests
  describe.only('listInfo', () => {
    it('retrieves a list of data source info', () =>
      dataSources.listInfo(conn).then(res => {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data_sources)).toBe(true);
      }));
  });

  describe('info', () => {
    it('retrieves an exsiting data source info', () =>
      assureExists()
        .then(() => dataSources.info(conn, aDSName))
        .then(res => {
          expect(res.status).toBe(200);
          expect(typeof res.body.info).toBe('object');
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
          expect(typeof res.body).toBe('object');
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

  describe('test', () => {
    it('tests the connection of a reachable data source', () =>
      assureExists()
        .then(() => dataSources.test(conn, aDSName))
        .then(res => {
          expect(res.ok).toBe(true);
          expect(res.status).toBe(204);
        }));
  });

  describe('options', () => {
    it('returns the options of a data source', () =>
      assureExists()
        .then(() => dataSources.options(conn, aDSName))
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.options).toEqual({
            ...aOptions,
            'jdbc.username': '****',
            'jdbc.password': '****',
          });
        }));
  });

  describe('getMetadata', () => {
    it('returns the metadata of a data source', () =>
      assureExists()
        .then(() => dataSources.getMetadata(conn, aDSName))
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toMatchSnapshot();
        }));
  });

  describe('getTables', () => {
    it('returns the tables for a data source', () =>
      assureExists()
        .then(() => dataSources.getTables(conn, aDSName))
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toMatchSnapshot();
        }));
  });

  describe('getTableMetadata', () => {
    it('returns the metadata of a table', () =>
      assureExists()
        .then(() =>
          dataSources.getTableMetadata(conn, aDSName, {
            table_name: 'test_table',
            table_type: 'TABLE',
            catalog: 'stardogjs_test',
          })
        )
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toMatchSnapshot();
        }));
  });

  describe('updateMetadata', () => {
    it('updates the metadata of a data source', () =>
      assureExists()
        .then(() =>
          dataSources.updateMetadata(
            conn,
            aDSName,
            snapshots[
              'data_sources getMetadata returns the metadata of a data source 1'
            ]
              .trim()
              .slice(1, -1)
              .replace(/\\"/g, '"')
          )
        )
        .then(res => {
          expect(res.status).toBe(204);
        }));
  });

  describe('query', () => {
    it('executes a query with a string query parameter', () =>
      assureExists()
        .then(() =>
          dataSources.query(conn, aDSName, 'SELECT * FROM test_table')
        )
        .then(res => {
          expect(res.status).toBe(200);
          expect(typeof res.body).toBe('object');
        }));

    it('executes a query with an object query parameter', () =>
      assureExists()
        .then(() =>
          dataSources.query(conn, aDSName, {
            query: 'SELECT * FROM test_table',
            options: {
              'parser.sql.quoting': 'NATIVE',
              'sql.functions': '',
              'percent.encode': true,
            },
          })
        )
        .then(res => {
          expect(res.status).toBe(200);
          expect(typeof res.body).toBe('object');
        }));
  });

  describe('suggestions', () => {
    it('returns successfully when given a valid configuration', () =>
      assureExists().then(() =>
        dataSources
          .suggestions(
            conn,
            `
<tag:stardog:api:match:configuration> {
  [] <tag:stardog:api:match:source> <data-source://${aDSName}> ;
    <tag:stardog:api:match:sourceTable> "test_table" ;
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
