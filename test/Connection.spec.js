const { Connection } = require('../lib/index2');

describe('Stardog.Connection', () => {
  it('creates a new connection object', () => {
    const c = new Connection();
    expect(c).toBeInstanceOf(Connection);
  });

  it('creates a new connection object with options', () => {
    const c = new Connection({
      username: 'admin',
      password: 'admin',
      endpoint: 'http://localhost:5820/DB/',
      reasoning: false,
    });
    expect(c).toMatchObject({
      username: 'admin',
      password: 'admin',
      endpoint: 'http://localhost:5820/DB',
      reasoning: false,
    });
  });

  describe('config()', () => {
    it('overwrites existing config options', () => {
      const c = new Connection({
        username: 'admin',
        password: 'foo',
      });
      expect(c).toMatchObject({
        username: 'admin',
        password: 'foo',
        endpoint: undefined,
        reasoning: false,
      });
      c.config({
        username: 'adam',
        password: 'admin',
        endpoint: 'http://localhost:3000/DB',
      });
      expect(c).toMatchObject({
        username: 'adam',
        password: 'admin',
        endpoint: 'http://localhost:3000/DB',
        reasoning: false,
      });
    });
  });
});
