const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateReview = [
    check('review')
      .exists({ checkFalsy: true })
      .withMessage('Review text is required'),
    check('stars')
      .exists({ checkFalsy: true })
      .isInt()
      .isLength({min:1, max:5})
      .withMessage('Stars must be an integer from 1 to 5'),
   
    handleValidationErrors
];

//routes go here


//



module.exports = router;