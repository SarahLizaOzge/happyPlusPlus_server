'use strict'

//Application Dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser');
const app = express();
const superagent = require('superagent');

//Application Setup
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const CLIENT_URL = process.env.CLIENT_URL;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

//Database Setup
const client = new pg.Client(DATABASE_URL);
client.connect();
client.on('error', console.error);

//Aplication Middleware
app.use(cors());
client.on('error', error => {
 console.error(error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// API Endpoints

app.get('/api/v1/videos/search', (req, res) => {
    let url = 'https://www.googleapis.com/youtube/v3/search';

    console.log('made it')
    
superagent.get(url)
    .query({ 'part': req.query.part })
    .query({'order':req.query.order})
    .query({'q':req.query.q})
    .query({'type':req.query.type})
    .query({ 'videoDefinition': req.query.videoDefinition })
    .query({ 'key': YOUTUBE_API_KEY })
    .then(arr => {
        console.log(arr)
        res.send(JSON.parse(arr.text))
    })
    .catch(console.error)
})



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

//   app.get('/api/v1/Userfavorites/:username', (req, res) => {
//     console.log(req.params.id);
//     client.query('SELECT * FROM Userfavorites where username =$1', [req.params.username])
//     .then(results => res.send(results.rows))
//     .catch(console.error)
// });


app.delete('/api/v1/users/:username', (req, res) => {
    client.query(
        'DELETE FROM users WHERE username=$1', [req.params.username])
        .then(() => res.sendStatus(204))
        .catch(err => {
          console.error(err);
          res.status(400).send('Bad Request; User ID does not exist');
        });
    });
    
app.get('/api/v1/addToFavorites', (req, res) => {
    console.log(req.params.username);
    client.query('SELECT * FROM Userfavorites where username =$1',)
    .then(results => res.send(results.rows))
    .catch(console.error)
});
app.post('/api/v1/addToFavorites', (req,res) =>{
    console.log('ADD TO FAVORITES IS CALLED');
    let result;
    client.query('SELECT FROM videos WHERE video_url=$1', [req.body.video_url])
    .then(result => result);
    console.log(result);
    if(result === undefined || result.length === 0){
        client.query('INSERT INTO videos VALUES($1, $2, $3, $4)', [req.body.video_url, req.body.videoid, req.body.description, req.body.title]);
    }
    client.query('INSERT INTO Userfavorites (video_url, username) VALUES ($1, $2)', [req.body.video_url, req.body.username])
    .then(()=>res.sendStatus(204))
    .catch(console.error)
})


app.all('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));