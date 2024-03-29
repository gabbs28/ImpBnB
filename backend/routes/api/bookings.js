const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Booking } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateExample = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email.'),
   
    handleValidationErrors
];

//routes go here

//edit a booking

//delete a booking

module.exports = router;