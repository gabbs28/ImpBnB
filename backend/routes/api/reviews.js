const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Booking, Spot, SpotImage, User } = require('../../db/models');

const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

module.exports = router;