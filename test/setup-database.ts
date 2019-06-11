import * as Path from 'path';
import * as RandomString from 'randomstring';
import { Connection, db } from '../lib';

const dbs = new Set(); // used to keep track of DBs across runs
const basePath = process.env.CIRCLECI ? '/var/opt/stardog/test/' : __dirname;

export const seedDatabase = (
  database: string,
  options = {},
  addlFiles = []
) => () => {
  const connection = ConnectionFactory();

  return db
    .create({
      connection,
      database,
      databaseSettings: {
        ...options,
        index: {
          type: 'disk',
        },
      },
      // Load everything into the DB
      files: [
        ...addlFiles.map((relPath) => ({
          filename: Path.resolve(basePath, relPath),
        })),
        {
          filename: Path.resolve(basePath, 'fixtures', 'api_tests.nt'),
        },
        {
          filename: Path.resolve(basePath, 'fixtures', 'reasoning', 'abox.ttl'),
        },
        {
          filename: Path.resolve(basePath, 'fixtures', 'reasoning', 'tbox.ttl'),
        },
        {
          filename: Path.resolve(basePath, 'fixtures', 'issues', 'data.ttl'),
        },
        {
          filename: Path.resolve(basePath, 'fixtures', 'issues', 'schema.ttl'),
        },
        {
          filename: Path.resolve(basePath, 'fixtures', 'paths.ttl'),
        },
      ],
    })
    .then((res: Response) => {
      expect(res.status).toBe(201);
    });
};

export const dropDatabase = (database: string) => () => {
  const connection = ConnectionFactory();
  return db
    .drop({
      connection,
      database,
    })
    .then((res) => {
      expect(res.status).toBe(200);
    });
};

export const generateDatabaseName = () => {
  const database = `stardogjs-${RandomString.generate({
    length: 25,
    charset: 'alphabetic',
  })}`;
  dbs.add(database);
  return database;
};

export const generateRandomString = () =>
  RandomString.generate({
    length: 10,
    charset: 'alphabetic',
  });

// tslint:disable:variable-name
export const ConnectionFactory = () =>
  new Connection({
    username: 'admin',
    password: 'admin',
    endpoint: 'http://localhost:5820',
  });
