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

app.get('/api/v1/users', (req, res) => {
    client.query('SELECT username, password, email FROM books;')
    .then(results => res.send(results.rows))
    .catch(console.error)
  });

app.post('/api/v1/users', (request, response) => {
    client.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2,$3);',
      [request.body.username, request.body.password, request.body.email])
    .then(results => response.send(201))
    .catch(console.error)
  });

app.all('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));