const express = require('express');

const app = express();

require('dotenv').config();
const port = process.env.PORT || 8083;

// HTTP requests / errors logger
const morgan = require('morgan');
app.use(morgan('dev'));

//const cors = require('cors');
//app.use(cors); // open the API on localhost / avoid cross origins restrictions that secures locally an API.

app.use(express.json());
// setup request url parsing ({ extended: true } precises that the req.body object will contain values of any type instead of just strings).
// A new body object containing the parsed data is populated on the request object after the middleware.
app.use(express.urlencoded({ extended: true }));

// dividing app in several route endpoints
const homeRouter = require('./routes/home').homeRouter;
app.use('/', homeRouter);

const ottersRouter = require('./routes/otters').ottersRouter;
app.use('/otters', ottersRouter);

app.listen(port, (err) => {
    if(err){
        console.error(`Error while launching the server ${err.message}`);
    } else {
        console.log(`Server listening on port ${port}`);
    }
});