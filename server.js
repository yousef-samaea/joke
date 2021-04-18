'use strict'
const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
app.use(cors());
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000 ;
app.use(express.static('./public'));
app.use(express.urlencoded({extended : true}));
const methodOverride = require('method-override');
const { response } = require('express');
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// app.get('/', (req,res) => {
// let SQL = `SELECT * FROM jokes`
// client.query(SQL).then(data => {
//     res.render('index',{dbJokes : data.rows});
// })
// })

app.get('/', (req,res) => {
    let url = 'https://official-joke-api.appspot.com/jokes/programming/ten';
    superagent.get(url).then(data =>{
        let jokesArr = data.body.map(createJoke);
        console.log(jokesArr);
        res.render('index', {jokes : jokesArr});
    });
});

function createJoke(joke){
let newJoke = {
    type : joke.type,
    setup : joke.setup,
    punchline : joke.punchline
}
return newJoke;
}

app.post('/addJoke', (req,res) => {
    let SQL = 'INSERT INTO joke (type, setup, punchline) VALUES ($1, $2, $3);';
    let values = [req.body.type, req.body.setup, req.body.punchline];
    client.query(SQL, values).then(data =>{
        res.redirect('favorite-jokes');
    });
});

app.get('/favorite-jokes', (req,res) => {
let SQL = 'SELECT * FROM joke;';
client.query(SQL).then(savedData => {
    console.log(savedData.rows);
    res.render('favorite-jokes', {jokes : savedData.rows});
});
});

app.get('/random', (req,res) => {
    let url = 'https://official-joke-api.appspot.com/jokes/programming/random';
    superagent.get(url).then(data =>{
        let randomJoke = data.body[0];
        res.render('random', {random : randomJoke});
    });
});

app.put('/jokes/update', (req,res) => {

    let SQL = `UPDATE joke SET type = $1, setup = $2, punchline = $3 where id = $4;`;
    let values = [req.body.type, req.body.setup, req.body.punchline, req.body.id];
    client.query(SQL, values).then(data =>{
        let jokeData = {
            type : req.body.type,
            setup : req.body.setup,
            punchline : req.body.punchline
        }
        res.render('detailed', {joke : jokeData});
    });
});

app.delete('/jokes/update', (req,res) => {

    let SQL = `DELETE FROM joke  where id = ${req.body.id};`;
    client.query(SQL).then(data =>{

        res.redirect('favorite-jokes');
    });
});

// client.connect.then(() =>{
//     app.listen(PORT, () => {
//         console.log(`listening to port: ${PORT}`);
//     })
// })

client.connect( () => {
    app.listen(PORT, () => {
        console.log(`listening to port: ${PORT}`);
    })
} )