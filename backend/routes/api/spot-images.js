const router = require('express').Router();

const del = require('./spot-images/delete.js');

router.use(del);

module.exports = router;