/* eslint-env jest */

const { cluster } = require('../../lib');
const { ConnectionFactory } = require('../setup-database');

describe('cluster.status()', () => {
  it('should retrieve a JS object containing cluster status', () => {
    const coordinatorConnection = ConnectionFactory(5821);

    return cluster.status(coordinatorConnection).then(res => {
      const { nodes } = res.body;
      const coordinator = nodes.find(node => node.address.search(/5821/) > 0);
      const participant = nodes.find(node => node.address.search(/5822/) > 0);

      expect(nodes.length).toEqual(2);
      expect(coordinator).not.toBeUndefined();
      expect(coordinator.metadata).not.toBeUndefined();
      expect(coordinator.type).toEqual('FULL');
      expect(participant).not.toBeUndefined();
      expect(participant.metadata).not.toBeUndefined();
      expect(participant.type).toEqual('FULL');
    });
  });

  it('should respond correctly from both nodes', () => {
    const participantConnection = ConnectionFactory(5822);

    return cluster.status(participantConnection).then(res => {
      const { nodes } = res.body;
      const coordinator = nodes.find(node => node.address.search(/5821/) > 0);
      const participant = nodes.find(node => node.address.search(/5822/) > 0);

      expect(nodes.length).toEqual(2);
      expect(coordinator).not.toBeUndefined();
      expect(coordinator.metadata).not.toBeUndefined();
      expect(coordinator.type).toEqual('FULL');
      expect(participant).not.toBeUndefined();
      expect(participant.metadata).not.toBeUndefined();
      expect(participant.type).toEqual('FULL');
    });
  });
});
