const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { SpotImage } = require('../../db/models');

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

//Delete a Spot Image


module.exports = router;