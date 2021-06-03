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

// dividing app in several route endpoints
const homeRouter = express.Router();
app.use('/', homeRouter);

const ottersRouter = express.Router();
app.use('/otters', ottersRouter);

// home API endpoint
homeRouter.get('/', (req, res) => {
    res.status(200).send('The Otter API (with some Otters and some CRUD)');
})

// Get all otters.. /otters endpoint
/* filters available:
    by name starting
    by weight max
    by numbers of cubs min
*/
ottersRouter.get('/', (req, res) => {

    //adding authorized params (check against list)
    const authParams = ['name', 'weight', 'cubs'];

    if(req.query){
        const querystringParams = Object.keys(req.query);
        const allAuth = querystringParams.every((param) => authParams.includes(param));

        if(!allAuth){
            res.status(400).send('You asked too much about Otters! (Error 400 - Bad Request!)');
            return;
        }
    }

    let sql = 'SELECT * FROM otter';
    const sqlFilters = [];

    if(req.query.name){
        sql += ' WHERE name LIKE ?';
        sqlFilters.push(`${req.query.name}%`);
    }

    if(req.query.weight){
        sql += req.query.name ? 'AND weight <= ?' : ' WHERE weight <= ?';
        sqlFilters.push(req.query.weight);
    }

    if(req.query.cubs){
        sql += req.query.name || req.query.weight ? 'AND cubs >= ?' : ' WHERE cubs >= ?';
        sqlFilters.push(req.query.cubs);
    }

    conn.promise().query(sql, sqlFilters)
        .then(([results]) => res.status(200).json(results))
        .catch((err) => res.status(500).send(`Error server: ${err.message}`));
});

// Get a specific otter.. /otters end-point
ottersRouter.get('/:id', (req, res) => {

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
                res.status(404).send(`Resource otter #${otterId} was not found!`);
            } else {
                res.status(500).send(`Error server: ${err.message}`);
            }
        });
});

ottersRouter.post('/', (req, res) => {
    const { name, being, about, weight, cubs, url } = req.body;

    const sql = 'INSERT INTO otter (name, being, about, weight, cubs, url) VALUES (?, ?, ?, ?, ?, ?)';

    conn.promise().query('sql', [name, being, about, weight, cubs, url])
                .then(([result]) => {
                    console.log(result)
                    const otterId = result.insertId;
                    res.status(201).json({ otterId, name, being, about, weight, cubs, url });
                })
                .catch((err) => {
                    res.status(500).send(`Error server: ${err.message}`);
                });
});

ottersRouter.patch('/:id', (req, res) => {

    let otter = null;
    const otterId = req.params.id;

    let sql = 'SELECT * FROM otter WHERE id = ?';

    conn.promise().query(sql, otterId)
            .then(([results]) => {
                if(!results.length){
                    return Promise.reject('NOT_EXISTING_RESOURCES');
                } else {
                    otter = results[0];
                    const otterProps = req.body;
                    sql = 'UPDATE otter SET ? WHERE id = ?';
                    return conn.promise().query(sql, [otterProps, otterId]);
                }
            })
            .then(() => {
                otter = { ...otter, otterProps};
                res.status(200).json(otter);
            })
            .catch((err) => {
                if(err === 'NOT_EXISTING_RESOURCES'){
                    res.status(404).send(`Couldn't modify otter #${otterId} resource, this resource doesn't exist!`);
                } else {
                    res.status(500).send(`Error server: ${err.message}`);
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