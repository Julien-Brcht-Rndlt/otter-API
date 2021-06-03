const express = require('express');
const router = express.Router();

// home API endpoint
router.get('/', (req, res) => {
    res.status(200).send('The Otter API (with some Otters and some CRUD)');
})

module.exports.homeRouter = router;