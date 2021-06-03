const express = require('express');

const app = express();

require('dotenv').config();
const port = process.env.PORT || 8083;

app.use(express.json());
// setup request url parsing ({ extended: true } precises that the req.body object will contain values of any type instead of just strings).
// A new body object containing the parsed data is populated on the request object after the middleware.
app.use(express.urlencoded({ extended: true }));

const conn = require('./db-config');
conn.connect((err) => {
    if(err){
        console.error(`Error while connecting to database: ${err.message}`,`${err.stack}`);
    } else {
        console.log(`Connected to database with threadId: ${conn.threadId}`);
    }
});

// Get all otters.. /otters end-point
app.get('/otters', (req, res) => {

    const sql = 'SELECT * FROM otter';

    conn.promise().query(sql)
        .then(([results]) => res.status(200).json(results))
        .catch((err) => res.status(500).send(`Error server: ${err.message}`));
});

// Get a specific otter.. /otters end-point
app.get('/otters/:id', (req, res) => {

    const otterId = req.params.id;
    const sql = 'SELECT * FROM otter WHERE id = ?';

    conn.promise().query(sql, otterId)
        .then(([results]) => {
            if(!results || !results.length) {
                return Promise.reject('NOT_FOUND_RESOURCES');
            }
            res.status(200).json(results)
        })
        .catch((err) => {
            if(err === 'NOT_FOUND_RESOURCES'){
                res.status(404).send(`Resource otter #${otterId} was not found!`)
            } else {
                res.status(500).send(`Error server: ${err.message}`)
            }
        });
});


app.listen(port, (err) => {
    if(err){
        console.error(`Error while launching the server ${err.message}`);
    } else {
        console.log(`Server listening on port ${port}`);
    }
});