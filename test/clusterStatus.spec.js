/* eslint-env jest */

const { cluster } = require('../lib');
const Fetch = require('../lib/fetch');
const { ConnectionFactory } = require('./setup-database');

describe('cluster.status()', () => {
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

  it('should retrieve a JS object containing cluster status', done => {
    const mockNodeCoordinator = {
      address: '127.0.0.1:6000',
      metadata: {},
      role: 'COORDINATOR',
      type: 'FULL',
    };
    const mockNodeParticipant = {
      address: '127.0.0.1:6001',
      metadata: {},
      role: 'PARTICIPANT',
      type: 'FULL',
    };
    const mockSuccessResponse = {
      nodes: [mockNodeCoordinator, mockNodeParticipant],
    };
    const mockJsonPromise = Promise.resolve(mockSuccessResponse);
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise,
      headers: mockHeaders,
    });

    jest.spyOn(Fetch, 'fetch').mockImplementation(() => mockFetchPromise);

    cluster
      .status(conn)
      .then(res => {
        const { nodes } = res.body;
        expect(nodes.length).toEqual(2);
        expect(res.body.nodes).toEqual([
          mockNodeCoordinator,
          mockNodeParticipant,
        ]);
      })
      .catch(err => {
        console.log(err);
        done.fail('There should not have been an error');
      });

    expect(Fetch.fetch).toHaveBeenCalledTimes(1);
    expect(Fetch.fetch).toHaveBeenCalledWith(
      'http://localhost:5820/admin/cluster/status',
      {
        headers: expectedHeaders,
      }
    );

    done();
  });
});
