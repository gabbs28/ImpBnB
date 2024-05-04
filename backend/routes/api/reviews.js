const router = require('express').Router();

const get = require('./reviews/get.js');
const create = require('./reviews/post.js');
const edit = require('./reviews/put.js');
const del = require('./reviews/delete.js');

router.use(get);
router.use(create);
router.use(edit);
router.use(del);

module.exports = router;