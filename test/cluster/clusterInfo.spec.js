/* eslint-env jest */

const { cluster } = require('../../lib');
const { ConnectionFactory } = require('../setup-database');

describe('cluster.info()', () => {
  const coordinatorPort = 5821;
  const participantPort = 5822;
  const expectedNodeCount = 2;

  it('should retrieve a JS object containing cluster information', () => {
    const coordinatorConnection = ConnectionFactory(coordinatorPort);

    return cluster.info(coordinatorConnection).then(res => {
      const { nodes } = res.body;
      const coordinator = nodes.find(node => node.includes(coordinatorPort));
      const participant = nodes.find(node => node.includes(participantPort));

      expect(nodes).toHaveLength(expectedNodeCount);
      expect(coordinator).not.toBeUndefined();
      expect(participant).not.toBeUndefined();
    });
  });

  it('should respond correctly from both nodes', () => {
    const participantConnection = ConnectionFactory(participantPort);

    return cluster.info(participantConnection).then(res => {
      const { nodes } = res.body;
      const coordinator = nodes.find(node => node.includes(coordinatorPort));
      const participant = nodes.find(node => node.includes(participantPort));

      expect(nodes).toHaveLength(expectedNodeCount);
      expect(coordinator).not.toBeUndefined();
      expect(participant).not.toBeUndefined();
    });
  });
});
