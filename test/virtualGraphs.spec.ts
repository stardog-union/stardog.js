import { virtualGraph } from '../lib/';
import { ConnectionFactory } from './setup-database';

describe('virtual_graphs', () => {
  let connection;
  const aVGName = 'MyGraph';
  const aMappings = ` @prefix stardog: <tag:stardog:api:> .
@prefix dept: <http://example.com/dept/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix emp: <http://example.com/emp/> .
@prefix : <http://api.stardog.com/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix sm: <tag:stardog:api:mapping:> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix rr: <http://www.w3.org/ns/r2rml#> .

[
	rr:logicalTable [
		a rr:BaseTableOrView ;
		rr:tableName "DEPT"
	] ;
	rr:subjectMap [
		rr:template "http://example.com/dept/{deptno}" ;
		rr:class dept:Department ;
		a rr:SubjectMap ;
		rr:termType rr:IRI ;
		a rr:TermMap
	] ;
	a rr:TriplesMap ;
	rr:predicateObjectMap [
		rr:predicate dept:location ;
		rr:objectMap [
			rr:termType rr:Literal ;
			rr:column "loc" ;
			a rr:TermMap , rr:ObjectMap
		] ;
		a rr:PredicateObjectMap
	] , [
		rr:objectMap [
			rr:termType rr:Literal ;
			rr:datatype xsd:integer ;
			a rr:TermMap , rr:ObjectMap ;
			rr:column "deptno"
		] ;
		rr:predicate dept:deptno ;
		a rr:PredicateObjectMap
	]
] .

[
	rr:predicateObjectMap [
		rr:predicate emp:department ;
		a rr:PredicateObjectMap ;
		rr:objectMap [
			a rr:ObjectMap , rr:TermMap ;
			rr:template "http://example.com/dept/{deptno}" ;
			rr:termType rr:IRI
		]
	] ;
	rr:logicalTable [
		a rr:R2RMLView ;
		rr:sqlQuery """
        SELECT empno, ename, deptno, (CASE job
            WHEN 'CLERK' THEN 'general-office'
            WHEN 'NIGHTGUARD' THEN 'security'
            WHEN 'ENGINEER' THEN 'engineering'
        END) AS ROLE FROM EMP
        """
	] ;
	rr:predicateObjectMap [
		a rr:PredicateObjectMap ;
		rr:predicate emp:name ;
		rr:objectMap [
			a rr:ObjectMap , rr:TermMap ;
			rr:column "ename" ;
			rr:termType rr:Literal
		]
	] , [
		a rr:PredicateObjectMap ;
		rr:predicate emp:role ;
		rr:objectMap [
			rr:termType rr:IRI ;
			rr:template "http://example.com/emp/{ROLE}" ;
			a rr:TermMap , rr:ObjectMap
		]
	] ;
	a rr:TriplesMap ;
	rr:subjectMap [
		a rr:SubjectMap , rr:TermMap ;
		rr:class emp:Employee ;
		rr:template "http://example.com/emp/{empno}" ;
		rr:termType rr:IRI
	]
] .
  `;
  const aOptions = {
    'jdbc.password': 'admin',
    namespaces: 'stardog=tag:stardog:api:\u0002rr=http://www.w3.org/ns/r2rml#',
    'jdbc.driver': 'com.mysql.jdbc.Driver',
    'jdbc.username': 'admin',
    'jdbc.url': 'jdbc:mysql://localhost/myDb',
  };

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  const assureExists = () =>
    virtualGraph
      .list({ connection })
      .then((res) => res.json())
      .then((body) => {
        const exists =
          body.virtual_graphs &&
          body.virtual_graphs.includes(`virtual://${aVGName}`);
        if (!exists) {
          return virtualGraph.add({
            connection,
            name: aVGName,
            mappings: aMappings,
            options: aOptions,
          });
        }
        return Promise.resolve({ status: 201 });
      });

  const assureNotExists = () =>
    virtualGraph
      .list({ connection })
      .then((res) => res.json())
      .then((body) => {
        const exists =
          body.virtual_graphs &&
          body.virtual_graphs.includes(`virtual://${aVGName}`);
        if (exists) {
          return virtualGraph.remove({ connection, name: aVGName });
        }
        return Promise.resolve({ status: 204 });
      });

  describe.only('list', () => {
    it('retrieves a list of VGs', () =>
      virtualGraph
        .list({ connection })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          expect(body).toHaveProperty('virtual_graphs');
          expect(body.virtual_graphs).toBeInstanceOf(Array);
        }));
  });

  describe('add', () => {
    it('adds a virtual graph', () =>
      assureNotExists()
        .then(() =>
          virtualGraph.add({
            connection,
            name: aVGName,
            mappings: aMappings,
            options: aOptions,
          })
        )
        .then((res) => {
          expect(res.status).toBe(201);
        }));
  });

  describe('update', () => {
    it('updates an existing virtual graph', () =>
      assureExists()
        .then(() =>
          virtualGraph.update({
            connection,
            name: aVGName,
            mappings: aMappings,
            options: aOptions,
          })
        )
        .then((res) => {
          expect(res.status).toBe(204);
        }));
  });

  describe('remove', () => {
    it('removes an existing virtual graph', () =>
      assureExists()
        .then(() => virtualGraph.remove({ connection, name: aVGName }))
        .then((res) => {
          expect(res.status).toBe(204);
        }));
  });

  describe('available', () => {
    it('returns true when a VG is available', () =>
      assureExists()
        .then(() => virtualGraph.available({ connection, name: aVGName }))
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          expect(body).toHaveProperty('available');
          expect(body.available).toBe(true);
        }));
  });

  describe('options/mappings', () => {
    it('returns the options/mappings of a VG', () =>
      assureExists()
        .then(() => virtualGraph.options({ connection, name: aVGName }))
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          expect(body).toHaveProperty('options');
          expect(body.options).toEqual(aOptions);
          return virtualGraph.mappings({ connection, name: aVGName });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.text();
        })
        .then((text) => {
          expect(text).toContain('subjectMap');
        }));
  });

  describe('mappings', () => {
    it('accepts options that trigger a request for untransformed mappings', () =>
      assureExists()
        .then(() =>
          virtualGraph.mappings({
            connection,
            name: aVGName,
            requestOptions: { preferUntransformed: true },
          })
        )
        .then((res) => {
          expect(res.url).toBe(
            connection.uri(
              'admin',
              'virtual_graphs',
              aVGName,
              'mappingsString',
              'SMS2'
            )
          );
          return virtualGraph.mappings({
            connection,
            name: aVGName,
            requestOptions: {
              preferUntransformed: true,
              syntax: 'R2RML',
            },
          });
        })
        .then((res) => {
          expect(res.url).toBe(
            connection.uri(
              'admin',
              'virtual_graphs',
              aVGName,
              'mappingsString',
              'R2RML'
            )
          );
          return virtualGraph.mappings({
            connection,
            name: aVGName,
            requestOptions: {
              preferUntransformed: false,
            },
          });
        })
        .then((res) => {
          expect(res.url).toBe(
            connection.uri('admin', 'virtual_graphs', aVGName, 'mappings')
          );
        }));
  });
});
