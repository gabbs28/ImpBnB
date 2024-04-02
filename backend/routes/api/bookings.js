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

//Get all of the Current User's Bookings

//Get all Bookings for a Spot based on the Spot's id

//Create a Booking from a Spot based on the Spot's id

//Edit a Booking

//Delete a Booking

module.exports = router;