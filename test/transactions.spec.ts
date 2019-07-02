import * as fs from 'fs';
import { query, db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';
import { RequestHeader, ContentType } from '../lib/constants';

const { transaction } = db;

type CommitParameter = Parameters<typeof transaction.commit>[0];
type AddParameter = Parameters<typeof db.add>[0];

interface CustomMatchers<T> extends jest.Matchers<T> {
  toBeGUID: () => T;
}
interface ExpectWithToBeGUID extends jest.Expect {
  <T = any>(actual: T): CustomMatchers<T>;
}

describe('transactions', () => {
  const database = generateDatabaseName();
  const connection = ConnectionFactory();

  const begin = () => transaction.begin({ connection, database });
  const commit = (data: Omit<CommitParameter, 'connection' | 'database'>) =>
    transaction.commit({ ...data, connection, database });
  const add = (data: Omit<AddParameter, 'connection' | 'database'>) =>
    db.add({ ...data, connection, database });

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  const expectWithToBeGUID: ExpectWithToBeGUID = expect as any;
  expectWithToBeGUID.extend({
    toBeGUID(received) {
      const pass =
        received.match(
          // Lifted from https://stackoverflow.com/a/13653180/1011616
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        ) != null;
      if (pass) {
        return {
          pass,
          message: () => `expected ${received} to not be a GUID`,
        };
      }
      return {
        pass,
        message: () => `expected ${received} to be a GUID`,
      };
    },
  });

  it('Should be able to get a transaction, add a triple and rollback', () => {
    const triple =
      '<http://localhost/publications/articles/Journal1/1940/Article2> ' +
      '<http://purl.org/dc/elements/1.1/subject> ' +
      '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

    return begin()
      .then((res) => {
        const txId = res.transactionId;
        expect(res.status).toBe(200);
        expectWithToBeGUID(txId).toBeGUID();
        return add({
          transactionId: txId,
          content: triple,
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return transaction.rollback({
          connection,
          database,
          transactionId: res.transactionId,
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });

  it('Should be able to get a transaction, add a triple with a defined prefix, commit that and query.', () => {
    const triple =
      // tslint:disable:prefer-template
      '@prefix foo: <http://localhost/publications/articles/Journal1/1940/> .\n' +
      '@prefix dc: <http://purl.org/dc/elements/1.1/> .\n' +
      'foo:Article2 ' +
      'dc:subject ' +
      '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

    return begin()
      .then((res) => {
        expect(res.status).toBe(200);
        expectWithToBeGUID(res.transactionId).toBeGUID();
        return add({
          transactionId: res.transactionId,
          content: triple,
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        expectWithToBeGUID(res.transactionId).toBeGUID();
        return commit({ transactionId: res.transactionId });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        const q = `
          prefix foo: <http://localhost/publications/articles/Journal1/1940/>
          prefix dc: <http://purl.org/dc/elements/1.1/>
          ask where {
          foo:Article2
          dc:subject
          "A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .}`;
        return query.execute({ connection, database, query: q });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => {
        expect(body).toBe(true);
        return begin();
      })
      .then((res) => {
        expect(res.status).toBe(200);
        expectWithToBeGUID(res.transactionId).toBeGUID();
        return db.remove({
          connection,
          database,
          transactionId: res.transactionId,
          content: triple,
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return commit({ transactionId: res.transactionId });
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });

  it('Should be able to get a transaction, add a triple, commit that and query.', () => {
    const triple =
      '<http://localhost/publications/articles/Journal1/1940/Article2> ' +
      '<http://purl.org/dc/elements/1.1/subject> ' +
      '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

    return begin()
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.text();
      })
      .then((transactionId) => {
        expectWithToBeGUID(transactionId).toBeGUID();
        return add({
          transactionId,
          content: triple,
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return commit({ transactionId: res.transactionId });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        const q =
          'ask where { ' +
          '<http://localhost/publications/articles/Journal1/1940/Article2> ' +
          '<http://purl.org/dc/elements/1.1/subject> ' +
          '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .}';
        return query.execute({ connection, database, query: q });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => {
        expect(body).toBe(true);
        return begin();
      })
      .then((res) =>
        db.remove({
          connection,
          database,
          transactionId: res.transactionId,
          content: triple,
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        })
      )
      .then((res) => {
        expect(res.status).toBe(200);
        return commit({ transactionId: res.transactionId });
      })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });

  it('Should be able to clean and insert all data in the DB using a transaction.', () => {
    const dbContent = fs.readFileSync(
      `${process.cwd()}/test/fixtures/api_tests.nt`,
      'utf-8'
    );
    return begin()
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((transactionId) => {
        expectWithToBeGUID(transactionId).toBeGUID();
        return db.clear({ connection, database, transactionId });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        expectWithToBeGUID(res.transactionId).toBeGUID();
        return commit({ transactionId: res.transactionId });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return db.size({ connection, database });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((text) => {
        const sizeNum = parseInt(text, 10);
        expect(sizeNum).toBe(0);
        return begin();
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text().then((text) => ({
          res,
          transactionId: text,
        }));
      })
      .then(({ res, transactionId }) => {
        expect(transactionId).toBe(res.transactionId);
        expectWithToBeGUID(transactionId).toBeGUID();
        return add({
          transactionId,
          content: dbContent,
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return commit({ transactionId: res.transactionId });
      })
      .then(() => db.size({ connection, database }))
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((text) => {
        const sizeNum = parseInt(text, 10);
        expect(sizeNum).toBe(42);
      });
  });
});
