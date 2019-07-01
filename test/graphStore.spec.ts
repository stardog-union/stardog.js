import { graph } from '../lib/db';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';
import { RequestHeader, ContentType } from '../lib/constants';

describe('graph store protocol', () => {
  const database = generateDatabaseName();
  const makeGraph = (name) => `http://example.org/namedgraphs#${name}`;
  let connection;

  beforeAll(seedDatabase(database, {}, ['fixtures/ng_tests.trig']));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  describe('graph.getGraph', () => {
    it('should retrieve named graphs', () =>
      graph
        .getGraph({ connection, database, graphUri: makeGraph('bob') })
        .then((res) => res.text())
        .then((text) => expect(text).toContain('bob@oldcorp.example.org')));

    it('should retrieve the default graph when no graph is specified', () =>
      graph
        .getGraph({ connection, database })
        .then((res) => res.text())
        .then((text) => {
          expect(text).toContain('http://purl.org/dc/elements/1.1/publisher');
          return graph.getGraph({ connection, database });
        })
        .then((res) => res.text())
        .then((text) => {
          expect(text).toContain('http://purl.org/dc/elements/1.1/publisher');
        }));

    it('should retrieve other RDF serializations when specified', () =>
      graph
        .getGraph({
          connection,
          database,
          requestHeaders: { [RequestHeader.ACCEPT]: 'application/rdf+xml' },
        })
        .then((res) => res.text())
        .then((text) => {
          expect(text).toContain('<rdf:RDF');
        }));
  });

  describe('graph.putGraph', () => {
    it('should create a new graph', () =>
      graph
        .putGraph({
          connection,
          database,
          graphData:
            '@prefix : <http://example.org/namedgraphs#> . :ed a :Person .',
          graphUri: makeGraph('ed'),
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        })
        .then((res) => {
          expect(res.status).toBe(201);
        }));

    it('should overwrite an existing graph', () =>
      graph
        .putGraph({
          connection,
          database,
          graphData:
            '_:b <http://xmlns.com/foaf/0.1/mbox> <mailto:alice@work.newexample.org> .',
          graphUri: makeGraph('alice'),
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return graph.getGraph({
            connection,
            database,
            graphUri: makeGraph('alice'),
          });
        })
        .then((res) => res.text())
        .then((text) => {
          expect(text).not.toContain('mailto:alice@work.example.org');
          expect(text).toContain('mailto:alice@work.newexample.org');
        }));
  });

  describe('graph.appendToGraph', () => {
    it('should create a new graph', () =>
      graph
        .appendToGraph({
          connection,
          database,
          graphData:
            '@prefix : <http://example.org/namedgraphs#> . :ed a :Person .',
          graphUri: makeGraph('ed'),
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        })
        .then((res) => {
          expect(res.status).toBe(200);
        }));
    it('should merge into an existing graph', () =>
      graph
        .appendToGraph({
          connection,
          database,
          graphData:
            '_:b <http://xmlns.com/foaf/0.1/mbox> <mailto:bob@newcorp.example.org> .',
          graphUri: makeGraph('bob'),
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return graph.getGraph({
            connection,
            database,
            graphUri: makeGraph('bob'),
          });
        })
        .then((res) => res.text())
        .then((text) => {
          expect(text).toContain('bob@oldcorp.example.org');
          expect(text).toContain('bob@newcorp.example.org');
        }));
  });

  describe('graph.deleteGraph', () => {
    it('should delete a graph', () =>
      graph
        .deleteGraph({ connection, database, graphUri: makeGraph('alice') })
        .then((res) => {
          expect(res.status).toBe(200);
          return graph.getGraph({
            connection,
            database,
            graphUri: makeGraph('alice'),
          });
        })
        .then((res) => res.text())
        .then((text) => {
          expect(text).toBe('[ ]');
        }));
  });
});
