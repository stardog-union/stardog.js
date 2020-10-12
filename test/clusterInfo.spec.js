/* eslint-env jest */

const { cluster } = require('../lib');
const Fetch = require('../lib/fetch');
const { ConnectionFactory } = require('./setup-database');

describe('cluster.info()', () => {
  let conn;
  let expectedHeaders;
  let mockHeaders;

  beforeEach(() => {
    conn = ConnectionFactory();
    expectedHeaders = conn.headers();
    expectedHeaders.set('Accept', 'application/json');
    mockHeaders = new Map();
    mockHeaders.set('content-type', 'application/json');
  });

  it('should retrieve a JS object containing cluster information', done => {
    const mockSuccessResponse = {
      nodes: ['127.0.0.1:6000', '127.0.0.1:6001'],
      coordinator: '127.0.0.1:6000',
    };
    const mockJsonPromise = Promise.resolve(mockSuccessResponse);
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise,
      headers: mockHeaders,
    });

    jest.spyOn(Fetch, 'fetch').mockImplementation(() => mockFetchPromise);

    cluster
      .info(conn)
      .then(res => {
        expect(res.body.nodes.length).toEqual(2);
        expect(res.body.nodes).toEqual(['127.0.0.1:6000', '127.0.0.1:6001']);
        expect(res.body.coordinator).toEqual('127.0.0.1:6000');
      })
      .catch(err => {
        console.log(err);
        done.fail('There should not have been an error');
      });

    expect(Fetch.fetch).toHaveBeenCalledTimes(1);
    expect(Fetch.fetch).toHaveBeenCalledWith(
      'http://localhost:5820/admin/cluster',
      {
        headers: expectedHeaders,
      }
    );

    done();
  });
});
