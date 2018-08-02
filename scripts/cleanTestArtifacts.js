const { db, user } = require('../lib');
const { ConnectionFactory } = require('../test/setup-database');

const artifactFilter = array =>
  array.filter(label => label.startsWith('stardogjs'));

const receipt = [];

const conn = ConnectionFactory();
const DBsRemover = db
  .list(conn)
  .then(res => res.body.databases)
  .then(artifactFilter)
  .then(dbs =>
    Promise.all(
      dbs.map(dbName =>
        db.drop(conn, dbName).then(res => {
          if (res.ok) {
            receipt.push(dbName);
          }
        })
      )
    )
  );

const usersRemover = user
  .list(conn)
  .then(res => res.body.users)
  .then(artifactFilter)
  .then(users =>
    Promise.all(
      users.map(username =>
        user.remove(conn, username).then(res => {
          if (res.ok) {
            receipt.push(username);
          }
        })
      )
    )
  );

const rolesRemover = user.role
  .list(conn)
  .then(res => res.body.roles)
  .then(artifactFilter)
  .then(roles =>
    Promise.all(
      roles.map(rolename =>
        user.role.remove(conn, rolename).then(res => {
          if (res.ok) {
            receipt.push(rolename);
          }
        })
      )
    )
  );

Promise.resolve(Promise.all([usersRemover, rolesRemover]))
  .then(() =>
    console.log(`Removed the following: ${JSON.stringify(receipt, null, 2)}`)
  )
  .catch(console.error);
