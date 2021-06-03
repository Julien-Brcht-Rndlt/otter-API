const express = require('express');
const router = express.Router();

const conn = require('../connection');

const joi = require('joi');

// Get all otters.. /otters endpoint
/* filters available:
    by name starting
    by weight max
    by numbers of cubs min */

router.get('/', (req, res) => {

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
    const paramsToValidate = {};

    if(req.query.name){
        sql += ' WHERE name LIKE ?';
        sqlFilters.push(`${req.query.name}%`);
        paramsToValidate.name = req.query.name;
    }

    if(req.query.weight){
        sql += req.query.name ? 'AND weight <= ?' : ' WHERE weight <= ?';
        sqlFilters.push(req.query.weight);
        paramsToValidate.weight = req.query.weight;
    }

    if(req.query.cubs){
        sql += req.query.name || req.query.weight ? 'AND cubs >= ?' : ' WHERE cubs >= ?';
        sqlFilters.push(req.query.cubs);
        paramsToValidate.cubs = req.query.cubs;
    }

    //validation of the parameters
    const { error: validationErrors } = joi.object({
        name: joi.string().max(50),
        weight: joi.number().min(0),
        cubs: joi.number().min(0),
    }).validate( paramsToValidate, { abortEarly: false });

    if(validationErrors) {
        res.status(422).json({ errors: validationErrors.details })
    } else {
        conn.promise().query(sql, sqlFilters)
        .then(([results]) => res.status(200).json(results))
        .catch((err) => res.status(500).send(`Error server: ${err.message}`));
    }
});

// Get a specific otter.. /otters end-point
router.get('/:id', (req, res) => {

    const otterId = req.params.id;
   
    //validation of the id path parameter
    const { error: validationErrors } = joi.object({
        otterId: joi.number().min(0).required(),
    }).validate({ otterId }, { abortEarly: false });

    if(validationErrors) {
        res.status(422).json({ errors: validationErrors.details })
    } else {

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
    }
});

router.post('/', (req, res) => {
    const { name, being, about, weight, cubs, url } = req.body;

    //validation of the parameters
    const { error: validationErrors } = joi.object({
        name: joi.string().max(50).required(),
        being: joi.string().max(50).required(),
        about: joi.string(),
        weight: joi.number().min(0),
        cubs: joi.number().min(0),
        url: joi.string().max(150),
    }).validate( { name, being, about, weight, cubs, url }, { abortEarly: false });

    if(validationErrors) {
        res.status(422).json({ errors: validationErrors.details })
    } else {

        const sql = 'INSERT INTO otter (name, being, about, weight, cubs, url) VALUES (?, ?, ?, ?, ?, ?)';

        conn.promise().query(sql, [name, being, about, weight, cubs, url])
                    .then(([result]) => {
                        console.log(result)
                        const otterId = result.insertId;
                        res.status(201).json({ otterId, name, being, about, weight, cubs, url });
                    })
                    .catch((err) => {
                        res.status(500).send(`Error server: ${err.message}`);
                    });
    }
});

router.patch('/:id', (req, res) => {

    const otterId = req.params.id;

    const otterProps = req.body;

    //validation of the id path parameter
    const { error: validationErrors } = joi.object({
        otterId: joi.number().min(0).required(),
    }).validate({ otterId }, { abortEarly: false });

    if(validationErrors) {
        res.status(422).json({ errors: validationErrors.details })
    } else {

        let otter = null;

        let sql = 'SELECT * FROM otter WHERE id = ?';

        conn.promise().query(sql, otterId)
                .then(([results]) => {
                    if(!results.length){
                        return Promise.reject('NOT_EXISTING_RESOURCES');
                    } else {
                        otter = results[0];
                        sql = 'UPDATE otter SET ? WHERE id = ?';
                        return conn.promise().query(sql, [otterProps, otterId]);
                    }
                })
                .then(() => {
                    otter = { ...otter, ...otterProps};
                    res.status(200).json(otter);
                })
                .catch((err) => {
                    if(err === 'NOT_EXISTING_RESOURCES'){
                        res.status(404).send(`Couldn't modify otter #${otterId} resource, this resource doesn't exist!`);
                    } else {
                        res.status(500).send(`Error server: ${err.message}`);
                    }
                });
    }
});

router.delete('/:id', (req, res) => {

    const otterId = req.params.id;

    //validation of the id path parameter
    const { error: validationErrors } = joi.object({
        otterId: joi.number().min(0).required(),
    }).validate({ otterId }, { abortEarly: false });

    if(validationErrors) {
        res.status(422).json({ errors: validationErrors.details })
    } else {

        const sql = 'DELETE FROM otter WHERE id = ?';

        conn.promise().query(sql, otterId)
                .then(([result]) => {
                if(result.affectedRows){
                    res.sendStatus(204);
                } else {
                    res.status(404).send(`Couldn't delete otter #${otterId} resource, this resource doesn't exist!`);
                }
                })
                .catch((err) => {
                    res.status(500).send(`Error server: ${err.message}`);
                });
    }
});



module.exports.ottersRouter = router;