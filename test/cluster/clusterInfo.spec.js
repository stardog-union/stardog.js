/* eslint-env jest */

const { cluster } = require('../../lib');
const { ConnectionFactory } = require('../setup-database');

describe('cluster.info()', () => {
  it('should retrieve a JS object containing cluster information', () => {
    const coordinatorConnection = ConnectionFactory(5821);

    return cluster.info(coordinatorConnection).then(res => {
      const { nodes } = res.body;
      const coordinator = nodes.find(node => node.search(/5821/) > 0);
      const participant = nodes.find(node => node.search(/5822/) > 0);

      expect(nodes.length).toEqual(2);
      expect(coordinator).not.toBeUndefined();
      expect(participant).not.toBeUndefined();
    });
  });

  it('should respond correctly from both nodes', () => {
    const participantConnection = ConnectionFactory(5822);

    return cluster.info(participantConnection).then(res => {
      const { nodes } = res.body;
      const coordinator = nodes.find(node => node.search(/5821/) > 0);
      const participant = nodes.find(node => node.search(/5822/) > 0);

      expect(nodes.length).toEqual(2);
      expect(coordinator).not.toBeUndefined();
      expect(participant).not.toBeUndefined();
    });
  });
});
