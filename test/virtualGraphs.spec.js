/* eslint-env jest */

const vGraphs = require('../lib/virtualGraphs');
const { ConnectionFactory } = require('./setup-database');

describe('virtual_graphs', () => {
  let conn;
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
    conn = ConnectionFactory();
  });

  const assureExists = () =>
    vGraphs.list(conn).then((res) => {
      const exists =
        res.body.virtual_graphs &&
        res.body.virtual_graphs.includes(`virtual://${aVGName}`);
      if (!exists) {
        return vGraphs.add(conn, aVGName, aMappings, aOptions);
      }
      return Promise.resolve({ status: 201 });
    });

  const assureNotExists = () =>
    vGraphs.list(conn).then((res) => {
      const exists =
        res.body.virtual_graphs &&
        res.body.virtual_graphs.includes(`virtual://${aVGName}`);
      if (exists) {
        return vGraphs.remove(conn, aVGName);
      }
      return Promise.resolve({ status: 204 });
    });

  describe.only('list', () => {
    it('retrieves a list of VGs', () =>
      vGraphs.list(conn).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('virtual_graphs');
        expect(res.body.virtual_graphs).toBeInstanceOf(Array);
      }));
  });

  describe('add', () => {
    it('adds a virtual graph', () =>
      assureNotExists()
        .then(() => vGraphs.add(conn, aVGName, aMappings, aOptions))
        .then((res) => {
          expect(res.status).toBe(201);
        }));
  });

  describe('update', () => {
    it('updates an existing virtual graph', () =>
      assureExists()
        .then(() => vGraphs.update(conn, aVGName, aMappings, aOptions))
        .then((res) => {
          expect(res.status).toBe(204);
        }));
  });

  describe('remove', () => {
    it('removes an existing virtual graph', () =>
      assureExists()
        .then(() => vGraphs.remove(conn, aVGName))
        .then((res) => {
          expect(res.status).toBe(204);
        }));
  });

  describe('available', () => {
    it('returns true when a VG is available', () =>
      assureExists()
        .then(() => vGraphs.available(conn, aVGName))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('available');
          expect(res.body.available).toBe(true);
        }));
  });

  describe('options/mappings', () => {
    it('returns the options/mappings of a VG', () =>
      assureExists()
        .then(() => vGraphs.options(conn, aVGName))
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('options');
          expect(res.body.options).toEqual(aOptions);
          return vGraphs.mappings(conn, aVGName);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toContain('subjectMap');
        }));
  });

  describe('mappings', () => {
    it('accepts options that trigger a request for untransformed mappings', () =>
      assureExists()
        .then(() =>
          vGraphs.mappings(conn, aVGName, { preferUntransformed: true })
        )
        .then((res) => {
          expect(res.url).toBe(
            conn.uri(
              'admin',
              'virtual_graphs',
              aVGName,
              'mappingsString',
              'SMS2'
            )
          );
          return vGraphs.mappings(conn, aVGName, {
            preferUntransformed: true,
            syntax: 'R2RML',
          });
        })
        .then((res) => {
          expect(res.url).toBe(
            conn.uri(
              'admin',
              'virtual_graphs',
              aVGName,
              'mappingsString',
              'R2RML'
            )
          );
          return vGraphs.mappings(conn, aVGName, {
            preferUntransformed: false,
          });
        })
        .then((res) => {
          expect(res.url).toBe(
            conn.uri('admin', 'virtual_graphs', aVGName, 'mappings')
          );
        }));
  });
});
