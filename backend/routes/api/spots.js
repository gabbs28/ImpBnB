const router = require('express').Router();

const get = require('./spots/get.js');
const create = require('./spots/post.js');
const edit = require('./spots/put.js');
const del = require('./spots/delete.js');

router.use(get);
router.use(create);
router.use(edit);
router.use(del);

module.exports = router;