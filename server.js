'use strict'

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const CLIENT_URL = process.env.CLIENT_URL;

const client = new pg.Client(DATABASE_URL);
client.connect();
client.on('error', console.error);

app.use(cors());
client.on('error', error => {
 console.error(error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//app.get('/test', (req, res) => res.send('hello world'));

app.get('/api/v1/users/:id', (req, res) => {
    console.log(req.params.id);
    client.query('SELECT * FROM users where username =$1', [req.params.id])
    .then(results => res.send(results.rows))
    .catch(console.error)
});

app.get('/api/v1/login', (req, res) => {
    client.query('SELECT password FROM users where username =$1', [req.query.username])
    .then(result => {
        if (result.rowCount === 0){
            console.log('user is not found');
            res.send(404);
        } 
        else if (result.rows[0]['password'] === req.query.password){
            console.log('User is logged-in');
            res.send(201);
        }else{
            console.log('User password is incorrect');
            res.send(404);
        }
    })
    .catch(console.error)
});

app.post('/api/v1/users', (request, response) => {
    client.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2,$3);',
      [request.body.username, request.body.password, request.body.email])
    .then(results => response.send(201))
    .catch(console.error)
  });

app.put('/api/v1/users/:username', (req, res) => {
    client.query(`
      UPDATE users
      SET email=$2
      WHERE username=$1`,[req.params.username , req.body.email])
    .then(() => res.sendStatus(204))
    .catch(console.error)
  })

app.delete('/api/v1/users/:username', (req, res) => {
    client.query(
        'DELETE FROM users WHERE username=$1', [req.params.username])
        .then(() => res.sendStatus(204))
        .catch(err => {
          console.error(err);
          res.status(400).send('Bad Request; User ID does not exist');
        });
    });

app.all('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));