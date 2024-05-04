const router = require('express').Router();

const get = require('./bookings/get.js');
const edit = require('./bookings/put.js');
const del = require('./bookings/delete.js');

router.use(get);
router.use(edit);
router.use(del);

module.exports = router;