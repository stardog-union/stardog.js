/* eslint-env jest */

const { cluster } = require('../../lib');
const { ConnectionFactory } = require('../setup-database');

describe('cluster.status()', () => {
  const coordinatorPort = 5821;
  const participantPort = 5822;
  const expectedNodeCount = 2;

  it('should retrieve a JS object containing cluster status', () => {
    const coordinatorConnection = ConnectionFactory(coordinatorPort);

    return cluster.status(coordinatorConnection).then((res) => {
      const { nodes } = res.body;
      const coordinator = nodes.find((node) =>
        node.address.includes(coordinatorPort)
      );
      const participant = nodes.find((node) =>
        node.address.includes(participantPort)
      );

      expect(nodes).toHaveLength(expectedNodeCount);
      expect(coordinator).not.toBeUndefined();
      expect(coordinator.metadata).not.toBeUndefined();
      expect(coordinator.type).toEqual('FULL');
      expect(participant).not.toBeUndefined();
      expect(participant.metadata).not.toBeUndefined();
      expect(participant.type).toEqual('FULL');
    });
  });

  it('should respond correctly from both nodes', () => {
    const participantConnection = ConnectionFactory(participantPort);

    return cluster.status(participantConnection).then((res) => {
      const { nodes } = res.body;
      const coordinator = nodes.find((node) =>
        node.address.includes(coordinatorPort)
      );
      const participant = nodes.find((node) =>
        node.address.includes(participantPort)
      );

      expect(nodes).toHaveLength(expectedNodeCount);
      expect(coordinator).not.toBeUndefined();
      expect(coordinator.metadata).not.toBeUndefined();
      expect(coordinator.type).toEqual('FULL');
      expect(participant).not.toBeUndefined();
      expect(participant.metadata).not.toBeUndefined();
      expect(participant.type).toEqual('FULL');
    });
  });
});
