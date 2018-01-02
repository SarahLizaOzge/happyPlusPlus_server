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
    
superagent.get(url)
    // .query({ 'q': query })
    .query({ 'part': req.query.part })
    .query({'order':req.query.order})
    .query({'q':req.query.q})
    .query({'type':req.query.type})
    .query({ 'videoDefinition': req.query.videoDefinition })
    .query({ 'key': API_KEY })
    // .then(response => response.responseJSON.items.map((video, idx) => {
         
    // }))
    .then(arr => {
        console.log(arr)
        res.send(arr)
    })
    .catch(console.error)
})



//my pseudo code:
// app.get('/api/v1/motivation', (req,res) => {
//    //go here: 
//    api.query(
//        url = `https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=motivation+ted+talk&type=video&videoDefinition=high&key=${YOUTUBE_API_KEY}`
//    ).then(result=>response.send(result.items))//where does this go? I want to send it to the client, and then pull the key value pairs I want from it, in order to render videos to page
//    .then(console.log('you reached api get route, your gettin videos'))
//    .catch(console.error)
//  });



//app.get('/test', (req, res) => res.send('hello world'));


app.all('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));