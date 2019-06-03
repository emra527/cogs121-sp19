/*
  All database handling is done here. Our sqlite database is in charge
  of account handling, as well as the account linking to educator plans.
*/

const express = require('express');
const app = express();
const request = require("request");

// bcrypt
// use this library to interface with SQLite databases: https://github.com/mapbox/node-sqlite3
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('passwords.db');

app.use(express.static('static_files'));


//Get all names for the check function on the home page.
  app.get('/users', (req, res) => {
    // db.all() fetches all results from an SQL query into the 'rows' variable:
    db.all('SELECT name FROM users_to_passwords', (err, rows) => {
      console.log(rows);
      const allUsernames = rows.map(e => e.name);
      console.log(allUsernames);
      res.send(allUsernames);
    });
  });

  //Gets all usernames and passwords
  app.get('/current', (req, res) => {
    // db.all() fetches all results from an SQL query into the 'rows' variable:
    db.all('SELECT * FROM current_user', (err, rows) => {
      if(rows[0]) {
        res.send(rows[0]);
      }
      else {
        res.send({});
      }
        // failed, so return an empty object instead of undefined

    });
  });

  //Finds a specific plan according to a certain username
  app.get('/plans/:name', (req, res) => {
    db.all('SELECT * FROM plans WHERE username=$username',
    {
      $username: req.params.name,
    },
    
    (err, rows) => {
      if(rows[0]) {
        res.send(rows[0]);
      }
      else {
        res.send({});
      }
    });

  });

  //Finds a specific plan using the educator share code
  app.get('/plans/code/:code', (req, res) => {
    db.all('SELECT * FROM plans WHERE sharecode=$code',
    {
      $code: req.params.code,
    },
    (err, rows) => {
      if(rows[0]) {
        res.send(rows[0]);
      }
      else {
        res.send({});
      }
    });
  });

  //Finds username/password from a username
  app.get('/users/:userid', (req, res) => {
    const nameToLookup = req.params.userid; // matches ':userid' above

    // db.all() fetches all results from an SQL query into the 'rows' variable:
    db.all(
      'SELECT * FROM users_to_passwords WHERE name=$name',
      // parameters to SQL query:
      {
        $name: nameToLookup
      },
      // callback function to run when the query finishes:
      (err, rows) => {
        console.log(rows);
        if (rows.length > 0) {
          res.send(rows[0]);
        } else {
          res.send({}); // failed, so return an empty object instead of undefined
        }
      }
      );
  });

// POST data about a user to insert into the database
// (note that this will insert duplicate entries!)
//
// To test, use the web frontend interface at:
//   http://localhost:3000/petsapp.html
// use this library to parse HTTP POST requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true})); // hook up with your app

app.post('/users', (req, res) => {
  console.log(req.body);

  //Adds a new user
  db.run(
    'INSERT INTO users_to_passwords VALUES ($name, $password, $SorT, $plan)',
    // parameters to SQL query:
    {
      $name: req.body.name,
      $password: req.body.password,
      $SorT: req.body.SorT,
      $plan: req.body.plan,
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        res.send({message: 'error in app.post(/users)'});
      } else {
        res.send({message: 'successfully run app.post(/users)'});
      }
    }
    );
});

//Removes a plan based on who is logged in
app.post('/plans/:name', (req, res) => {

  db.run(
    'DELETE FROM plans WHERE username=$name',
    {
      $name: req.params.name,
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        console.log(err);
        res.send({message: 'error in app.post(/users/:username)'});
      } else {
        res.send({message: 'successfully run app.post(/users/:username)'});
      }
    }
    );
});

app.post('/current', (req, res) => {
  console.log(req.body);

  db.run(
    'UPDATE current_user SET username = $name WHERE identity = "example"',
    // parameters to SQL query:
    {
      $name: req.body.name,
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        res.send({message: 'error in app.post(/users)'});
      } else {
        res.send({message: 'successfully run app.post(/users)'});
      }
    }
    );
});

//Distinguishes between educator and student
app.post('/SorT', (req, res) => {
  console.log(req.body);

  db.run(
    'UPDATE users_to_passwords SET SorT = $SorT WHERE name = $name',
    // parameters to SQL query:
    {
      $name: req.body.name,
      $SorT: req.body.SorT,
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        res.send({message: 'error in app.post(/users)'});
      } else {
        res.send({message: 'successfully run app.post(/users)'});
      }
    }
    );
});

//Adds a plan into the database with a unique sharecode
app.post('/plans', (req, res) => {
  console.log(req.body);

  db.run(
    'INSERT INTO plans VALUES ($plan, $username, $sharecode)',
    // parameters to SQL query:
    {
      $plan: req.body.plan,
      $username: req.body.username,
      $sharecode: req.body.sharecode,
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        res.send({message: 'error in app.post(/plans)'});
      } else {
        res.send({message: 'successfully run app.post(/plans)'});
      }
    }
    );
});


// start the server at URL: http://localhost:3000/
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});
