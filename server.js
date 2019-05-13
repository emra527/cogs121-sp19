
const express = require('express');
const app = express();
const request = require("request");

// bcrypt
// use this library to interface with SQLite databases: https://github.com/mapbox/node-sqlite3
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('passwords.db');

app.use(express.static('static_files'));


app.get('/users', (req, res) => {
  // db.all() fetches all results from an SQL query into the 'rows' variable:
  db.all('SELECT name FROM users_to_passwords', (err, rows) => {
    console.log(rows);
    const allUsernames = rows.map(e => e.name);
    console.log(allUsernames);
    res.send(allUsernames);
  });
});

app.get('/current', (req, res) => {
  // db.all() fetches all results from an SQL query into the 'rows' variable:
  db.all('SELECT * FROM current_user', (err, rows) => {
    res.send(rows[0]);
       // failed, so return an empty object instead of undefined

  });
});

request('https://api.harvardartmuseums.org/object?keyword=dog&size=10&apikey=3626f450-6473-11e9-a8d2-cd4f8edc6e52', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body.info);
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

// GET profile data for a user
//
// To test, open these URLs in your browser:
//   http://localhost:3000/users/Philip
//   http://localhost:3000/users/Carol
//   http://localhost:3000/users/invalidusername
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


const fakeGalleries = {
  'Dutch':
  {
    "objectcount": 27,
    "floor": 2,
    "name": "European Art, 17th–19th century",
    "theme": "Seventeenth–Century Dutch and Flemish Art",
    "keywords": "Dutch"
  },
  'Renaissance':
  {
    "objectcount": 35,
    "floor": 2,
    "name": "European Art, 13th–16th century",
    "theme": "The Renaissance",
    "keywords":"Renaissance"
  }
};


// GET a list of all galleries
//
// To test, open this URL in your browser:
//   http://localhost:3000/users
app.get('/galleries', (req, res) => {
  const allGalleries = Object.keys(fakeGalleries); // returns a list of object keys
  console.log('fakeGalleries is:', fakeGalleries);
  res.send(allGalleries);
});


// GET gallery data
//
app.get('/galleries/:galleryid', (req, res) => {
  const galleryToSearch = req.params.galleryid; // matches ':galleryid' above
  const val = fakeGalleries[galleryToSearch];
  console.log(galleryToSearch, '->', val); // for debugging
  if (val) {
    res.send(val);
  } else {
    res.send({}); // failed, so return an empty object instead of undefined
  }
});


// start the server at URL: http://localhost:3000/
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});
