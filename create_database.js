const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('passwords.db');

// run each database statement *serially* one after another
// (if you don't do this, then all statements will run in parallel,
//  which we don't want)
db.serialize(() => {
  // create a new database table:
  db.run("CREATE TABLE users_to_passwords (name TEXT, password TEXT, SorT TEXT, plan TEXT)");

  // insert 3 rows of data:
  db.run("INSERT INTO users_to_passwords VALUES ('tim', '007', '1', '0')");
  //db.run("INSERT INTO users_to_pets VALUES ('John', 'student', 'dog.jpg')");
  //db.run("INSERT INTO users_to_pets VALUES ('Carol', 'engineer', 'bear.jpg')");

  console.log('successfully created the users_to_passwords table in passwords.db');

  // print them out to confirm their contents:
  db.each("SELECT name, password FROM users_to_passwords", (err, row) => {
      console.log(row.name + ": " + row.password+ ": " + row.SorT+": " + row.plan);
  });
});

db.close();
