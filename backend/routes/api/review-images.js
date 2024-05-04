const router = require('express').Router();

const del = require('./review-images/delete.js');

router.use(del);

module.exports = router;