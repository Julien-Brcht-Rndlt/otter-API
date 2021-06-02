const express = require('express');

const app = express();

const port = 8083;

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

app.listen(port, (err) => {
    if(err){
        console.error(`Error while launching the server ${err.message}`);
    } else {
        console.log(`Server listening on port ${port}`);
    }
});