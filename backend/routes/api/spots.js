// backend/routes/api/users.js
const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Spot } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateExample = [
    check('address')
      .exists({ checkFalsy: true })
      .withMessage('Street address is required'),
    check('city')
      .exists({ checkFalsy: true })
      .isAlpha()
      .withMessage('City is required'),
    check('state')
      .exists({ checkFalsy: true })
      .isAlpha()
      .withMessage('State is required'),
    check('country')
      .exists({ checkFalsy: true })
      .isAlpha()
      .withMessage('Country is required'),
    check('lat')
      .exists({ checkFalsy: true })
      .isDecimal()
      .withMessage('Latitude is not valid'),
    check('lng')
      .exists({ checkFalsy: true })
      .isDecimal()
      .withMessage('Longitude is not valid'),
    check('name')
      .exists({ checkFalsy: true })
      .isLength({ max: 49 })
      .withMessage('Name must be less than 50 characters'),
    check('description')
      .exists({ checkFalsy: true })
      .isAlpha()
      .withMessage('Description is required'),
    check('price')
      .exists({ checkFalsy: true })
      .isDecimal()
      .withMessage('Price per day is required'),
   
    handleValidationErrors
];

//routes go here
router.get("/api/spots", async(req, res, next) => {

    const getAllSpots= await Spot.findAll({
      include: SpotId
    })

    return res.json({
 
    });
  }
)


module.exports = router;