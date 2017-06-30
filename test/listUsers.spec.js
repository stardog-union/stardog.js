const { Connection, user } = require('../lib/index2');

describe('List Users Test Suite', () => {
  let conn;

  beforeEach(() => {
    conn = new Connection({
      endpoint: 'http://localhost:5820/',
      username: 'admin',
      password: 'admin',
    });
  });

  it('should return a list of current registered users in the system.', () => {
    return user.list(conn).then(res => {
      expect(res.status).toEqual(200);
      expect(res.result.users).toContain('admin');
    });
  });
});
